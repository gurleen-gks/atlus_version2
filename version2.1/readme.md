query example: 
1)http://localhost:3000/checkstatus
  To check whether loged in or not. Can be used in the mainpage before using ajax to call the API
2)log in
http://localhost:3000/login?email=clesss@gmail.com&pwd=205

3)register 
http://localhost:3000/register?email=clesss@gmail.com&pwd=205&name=clesss

4)logout 
http://localhost:3000/logout

5)query 
After login: 
  http://localhost:3000/atlusapi/allAuthors?application=apache-accumulo
  http://localhost:3000/atlusapi/allmetrics 
  http://localhost:3000/atlusapi/allApplications/ 
  http://localhost:3000/atlusapi/showNodes?application=apache-accumulo&metric=design&table=pmd_uni&filters=cts.cwhen >'2016-09-01'
  http://localhost:3000/atlusapi/showNodes?application=apache-accumulo&metric=design&table=pmd_uni&filters=cts.cwhen >'2016-09-01' and cts.email='ctubbsii@apache.org'

login and query:(add parameter:email=clesss@gmail.com&pwd=205) 
  http://localhost:3000/atlusapi/allAuthors?application=apache-accumulo&email=clesss@gmail.com&pwd=205 

