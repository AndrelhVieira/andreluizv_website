CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathname" text NOT NULL,
	"url" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"source_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_pathname_unique" UNIQUE("pathname"),
	CONSTRAINT "assets_source_path_unique" UNIQUE("source_path")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body_mdx" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"lastmod" timestamp with time zone,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"authors" text[] DEFAULT '{}'::text[] NOT NULL,
	"layout" text DEFAULT 'PostBanner' NOT NULL,
	"draft" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"series_title" text,
	"series_order" integer,
	"canonical_url" text,
	"bibliography" text,
	"reading_time" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "posts_locale_slug_idx" ON "posts" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "posts_locale_date_idx" ON "posts" USING btree ("locale","date" DESC NULLS LAST);