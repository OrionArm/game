CREATE TABLE "short_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(2048) NOT NULL,
	"alias" varchar(20) NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "short_urls_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "url_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" varchar(20) NOT NULL,
	"ip_address" "inet" NOT NULL,
	"visited_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "url_visits" ADD CONSTRAINT "url_visits_alias_short_urls_alias_fk" FOREIGN KEY ("alias") REFERENCES "public"."short_urls"("alias") ON DELETE cascade ON UPDATE no action;