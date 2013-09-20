SET CLIENT_ENCODING TO UTF8;
CREATE TABLE "prunes" (
	pid serial,
	gid integer NOT NULL,
	comment character varying(255) DEFAULT NULL::character varying,
	prune_date timestamp without time zone NOT NULL,
           created timestamp without time zone NOT NULL default CURRENT_TIMESTAMP
);
ALTER TABLE "prunes" ADD PRIMARY KEY (pid);
