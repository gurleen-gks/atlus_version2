package net.behnamghader.atlas.db.toJson;

import java.io.FileWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import net.behnamghader.atlas.db.DB_Master;

public class D3ToJsonSupport {

	public static void main(String[] args) throws IOException {

		String table = args[0];
		String application = args[1];
		String attribute = args[2];
		String diff = args[3];

		String outJsonFile = args[4];

		D3ToJsonSupport d3json = new D3ToJsonSupport();

		JSONObject json = d3json.createJSONObjectFromDB(table, application, attribute, diff.equals("diff"));

		FileWriter writer = new FileWriter(outJsonFile);
		String pretty = prettifyJson(json.toJSONString());
		writer.write(pretty);
		writer.close();

	}

	private JSONObject createJSONObjectFromDB(String application, String table, String attribute, boolean diff) {

		JSONObject json = new JSONObject();
		JSONArray nodes = new JSONArray();
		JSONArray links = new JSONArray();
		
		Set<String> currs = new HashSet<String> ();
		Set<String> prevs = new HashSet<String> ();
		
		try {

			String[] localAttr = { attribute };
			List<List<Object>> results;
			if (diff)
				results = DB_Master.getInstance().getToJsonUniResultsDiff(table, application, localAttr);
			else{
//				results = DB_Master.getInstance().getChartUniResults(table, application, localAttr);
				results = null;
			}
				

			for (List<Object> l : results) {
				int count = 0;
				String curr = (String) l.get(count++);
				String prev = (String) l.get(count++);
				String email = (String) l.get(count++);
				Date cwhen = (Date) l.get(count++);
				Double qualityChange = (Double) l.get(count++);
				Double qualityAbsolute = (Double) l.get(count++);
				if (!currs.contains(curr)){
					currs.add(curr);
					JSONObject node = new JSONObject();
					node.put("id", curr);
					node.put("time", cwhen.toString());
					node.put("author", email);
					node.put("type", "circle");
					node.put(table+"."+attribute, qualityAbsolute);
					nodes.add(node);
				} 

				prevs.add(prev);
				
				JSONObject link = new JSONObject();
				link.put("source", prev);
				link.put("target", curr);
				link.put(table+"__"+attribute, qualityChange);
				links.add(link);

			}

			for (String prev:prevs)
				if (!currs.contains(prev)){
					Map<String,Object> info = DB_Master.getInstance().getCommitInfo(application,prev);
					JSONObject node = new JSONObject();
					System.out.println(info.get("csha")+ " "+info.get("cwhen").toString());
					node.put("id", info.get("csha"));
					node.put("time", info.get("cwhen").toString());
					node.put("author", info.get("email"));
					node.put("type", "circle");
					nodes.add(node);
				}
			json.put("nodes", nodes);
			json.put("links", links);

		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return json;
	}

	public static String prettifyJson(String json) {
		JsonElement jsonElement = new JsonParser().parse(json);
		return new GsonBuilder().setPrettyPrinting().create().toJson(jsonElement);
	}
}
