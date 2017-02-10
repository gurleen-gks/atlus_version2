2/10/2017---------------------------------------------------
added a table named registered_user to storage the user data

CREATE TABLE public.registered_user
(
    username text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT registered_user_pkey PRIMARY KEY (email)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.registered_user
    OWNER to postgres;



run it using terminal:

curl  -X POST -d "name=xxxx@xxxx&pwd=ppppppp&csha=c906e4ba6436b87b7cdfc168fc318f2ff27da279" http://127.0.0.1:3000/login


xxxx@xxxxshould be the email address you have registered.
ppppppp should be the password storaged in registered_user
