create database todo;

use todo;

create table user(
	name VARCHAR(400),
	email varchar(400),
	password varchar(400),
	reset_token varchar(400)
);

create table tasklist(

	name varchar(400),
	task varchar(700)
);