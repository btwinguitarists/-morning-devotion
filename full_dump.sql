--
-- PostgreSQL database dump
--

\restrict x1ePnhdYbMFI35aYk4MvFMKX9XNBKdTfTZfUhh24qmnyw7tfW2qnmoiYzCIqMje

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_items (
    id integer NOT NULL,
    session_id integer NOT NULL,
    reference character varying NOT NULL,
    completed boolean DEFAULT false NOT NULL
);


ALTER TABLE public.checklist_items OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_items_id_seq OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_items_id_seq OWNED BY public.checklist_items.id;


--
-- Name: highlights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.highlights (
    id integer NOT NULL,
    session_id integer NOT NULL,
    book_id character varying NOT NULL,
    chapter integer NOT NULL,
    verse_start integer NOT NULL,
    verse_end integer NOT NULL,
    highlight_text text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.highlights OWNER TO postgres;

--
-- Name: highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.highlights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.highlights_id_seq OWNER TO postgres;

--
-- Name: highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.highlights_id_seq OWNED BY public.highlights.id;


--
-- Name: mood_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mood_entries (
    id integer NOT NULL,
    session_id integer NOT NULL,
    value integer NOT NULL,
    note text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.mood_entries OWNER TO postgres;

--
-- Name: mood_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mood_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mood_entries_id_seq OWNER TO postgres;

--
-- Name: mood_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mood_entries_id_seq OWNED BY public.mood_entries.id;


--
-- Name: prayer_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prayer_responses (
    id integer NOT NULL,
    session_id integer NOT NULL,
    step_id character varying NOT NULL,
    question_text_snapshot text DEFAULT ''::text NOT NULL,
    answer_text text DEFAULT ''::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prayer_responses OWNER TO postgres;

--
-- Name: prayer_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prayer_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prayer_responses_id_seq OWNER TO postgres;

--
-- Name: prayer_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prayer_responses_id_seq OWNED BY public.prayer_responses.id;


--
-- Name: prayer_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prayer_sessions (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    date character varying NOT NULL,
    plan_day integer NOT NULL,
    status character varying(20) DEFAULT 'in-progress'::character varying NOT NULL,
    started_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    current_step integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.prayer_sessions OWNER TO postgres;

--
-- Name: prayer_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prayer_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prayer_sessions_id_seq OWNER TO postgres;

--
-- Name: prayer_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prayer_sessions_id_seq OWNED BY public.prayer_sessions.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: checklist_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items ALTER COLUMN id SET DEFAULT nextval('public.checklist_items_id_seq'::regclass);


--
-- Name: highlights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights ALTER COLUMN id SET DEFAULT nextval('public.highlights_id_seq'::regclass);


--
-- Name: mood_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mood_entries ALTER COLUMN id SET DEFAULT nextval('public.mood_entries_id_seq'::regclass);


--
-- Name: prayer_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prayer_responses ALTER COLUMN id SET DEFAULT nextval('public.prayer_responses_id_seq'::regclass);


--
-- Name: prayer_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prayer_sessions ALTER COLUMN id SET DEFAULT nextval('public.prayer_sessions_id_seq'::regclass);


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_items (id, session_id, reference, completed) FROM stdin;
1	3	Psalms 1	f
3	3	Psalms 3	f
4	3	Psalms 4	f
5	3	Psalms 5	f
2	3	Psalms 2	t
8	4	Psalms 3	f
9	4	Psalms 4	f
10	4	Psalms 5	f
6	4	Psalms 1	t
7	4	Psalms 2	t
\.


--
-- Data for Name: highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.highlights (id, session_id, book_id, chapter, verse_start, verse_end, highlight_text, created_at) FROM stdin;
1	3	PSA	1	1	1	manwho	2026-02-21 10:53:59.249704
2	3	PSA	1	2	2	But his delight is in the Law of the LORD,and on His law he meditates day and night.	2026-02-21 10:54:10.311396
\.


--
-- Data for Name: mood_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mood_entries (id, session_id, value, note) FROM stdin;
1	3	5	
\.


--
-- Data for Name: prayer_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prayer_responses (id, session_id, step_id, question_text_snapshot, answer_text, updated_at) FROM stdin;
\.


--
-- Data for Name: prayer_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prayer_sessions (id, user_id, date, plan_day, status, started_at, completed_at, current_step) FROM stdin;
4	test-reading-zZx3CM	2026-02-21	1	in-progress	2026-02-21 11:00:21.911621	\N	1
3	55085462	2026-02-21	1	in-progress	2026-02-21 10:53:33.034185	\N	10
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (sid, sess, expire) FROM stdin;
p2EWJJKCCvgwIqkLuQ_DJ04NHziMwrJB	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T11:00:14.265Z", "httpOnly": true, "originalMaxAge": 604799999}, "passport": {"user": {"claims": {"aud": "c73bcfdc-ae1c-437b-a9e3-e0e6330e2411", "exp": 1771675214, "iat": 1771671614, "iss": "https://test-mock-oidc.replit.app/", "jti": "4757d6bb658d948a717f1e3cc521c157", "sub": "test-reading-zZx3CM", "email": "readerffrPz5@example.com", "auth_time": 1771671614, "last_name": "Test", "first_name": "Reader"}, "expires_at": 1771675214, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzcxNjcxNjE0LCJleHAiOjE3NzE2NzUyMTQsInN1YiI6InRlc3QtcmVhZGluZy16WngzQ00iLCJlbWFpbCI6InJlYWRlcmZmclB6NUBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJSZWFkZXIiLCJsYXN0X25hbWUiOiJUZXN0In0.tiZMTnX1k7VxTYxKaIbHkiua4KJa6HouC_txYRCAE4JcKuz9iz1GJ1zrhXcApYeVaTgZhPwU7O321oYcvQUG1tT1yqAe09Xwr51-sM7C-OaMPaXN7nHYkXcRxx3AU2UcetQefAX3atE0Q427qUtKEm7nsjdCyQRsAaLhHNBFk_f2CcZYzMS20ZAFgJYHic628jo2ceNzzoxqi2wBIi-tZhuJAj0JXSc1G8jYsZL7a9aL1dXABvl86nT0GNynXi1mT4GVz8tTptYeFdCkIJe2lBVY7FyeEGCHKi_To02KV3n3U3gww51VwwsPzJMTvUsirz3PLFCd_SSPtpp3NKBKFg", "refresh_token": "eyJzdWIiOiJ0ZXN0LXJlYWRpbmctelp4M0NNIiwiZW1haWwiOiJyZWFkZXJmZnJQejVAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiUmVhZGVyIiwibGFzdF9uYW1lIjoiVGVzdCJ9"}}}	2026-02-28 11:01:02
gdzGHGkTvLUCfNl3t2VZwR8KMsDUhC0W	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T11:15:40.479Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "c73bcfdc-ae1c-437b-a9e3-e0e6330e2411", "exp": 1771676140, "iat": 1771672540, "iss": "https://test-mock-oidc.replit.app/", "jti": "d5e64cde9d2829bd989e663831b988e8", "sub": "test-about-KVNHLB", "email": "aboutqcI_8V@example.com", "auth_time": 1771672540, "last_name": "Tester", "first_name": "About"}, "expires_at": 1771676140, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzcxNjcyNTQwLCJleHAiOjE3NzE2NzYxNDAsInN1YiI6InRlc3QtYWJvdXQtS1ZOSExCIiwiZW1haWwiOiJhYm91dHFjSV84VkBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJBYm91dCIsImxhc3RfbmFtZSI6IlRlc3RlciJ9.cWzoul7ERN59YlPp_-LyP0mOsxpHv-PEd7muNK7JUvH4ZQ1hbvRR0X3J8McxxqYbeewEkRhuF6bz2b-A6y_XafS7_vo7LrTpuP9ufvvm5dz2s0g4ITNmFI9TDVMD6C3cR9_x-mVq2TdLZGMsqJGSyGwHQH8CjcIH9kDa88Whs5XJJ-QQIMM9jYwAD1tXAJcCh48KwJqDb3y8LHuWGUzx2fDS5IS3QwT6T2EesoQcY6wyvBlmAo1wxKOWmvS_jf9TowlFmGG_hV_QlFmHVIhs8J8rYWsGrAIMXjFv7yEbGfhoCHOvid7zbkuttd4bwYMC2Tju7CxPgeh62Qlpv6zpEw", "refresh_token": "eyJzdWIiOiJ0ZXN0LWFib3V0LUtWTkhMQiIsImVtYWlsIjoiYWJvdXRxY0lfOFZAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiQWJvdXQiLCJsYXN0X25hbWUiOiJUZXN0ZXIifQ"}}}	2026-02-28 11:15:53
1tJyB1W_v7q8fzTcT9LzpfjeeClTXg0a	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T10:36:11.629Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "c73bcfdc-ae1c-437b-a9e3-e0e6330e2411", "exp": 1771673771, "iat": 1771670171, "iss": "https://test-mock-oidc.replit.app/", "jti": "778c5293290f3dcf6aa3d94ec4581f62", "sub": "test-eremos-TqS-Sy", "email": "testuserYIQQ_b@example.com", "auth_time": 1771670171, "last_name": "User", "first_name": "Test"}, "expires_at": 1771673771, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzcxNjcwMTcxLCJleHAiOjE3NzE2NzM3NzEsInN1YiI6InRlc3QtZXJlbW9zLVRxUy1TeSIsImVtYWlsIjoidGVzdHVzZXJZSVFRX2JAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiVGVzdCIsImxhc3RfbmFtZSI6IlVzZXIifQ.KBRFDGdDpXRCv_HP45yqlKPQ0Zhk4TDF4G0Q98d8WOKKyLMSwljJGhDuDCW_1lFmqPu_Gqvjlr6P4eUDe7uIL0V-7SveFJ8f_46EQiFAm5opNPf6wYbBTU7n4dcGfZk7hLvVQi6KAPRTBEymV_oeuMVc3mZeFtgS8v_WnSpDg-Rll48eERyWTgpa8mqUu30xQymkfqfp34QN4Wuz7SIRpU7G2xP4rcPS8DKMUcJ2m1eJpuZsImpBUSPL_1aZNcFfV68QvfiUeTw4glHRzDejnPbPW2qWPZeDRM1CbkUIaNMAuO7z-6TmLNEQT3Pa7OMCsQ5u_Fa65oaGg2GOFyV1wg", "refresh_token": "eyJzdWIiOiJ0ZXN0LWVyZW1vcy1UcVMtU3kiLCJlbWFpbCI6InRlc3R1c2VyWUlRUV9iQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IlRlc3QiLCJsYXN0X25hbWUiOiJVc2VyIn0"}}}	2026-02-28 10:36:40
H-8g9n-Eau5J4ULwb_vdFTD0Kt91QSoa	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T12:05:54.069Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "c73bcfdc-ae1c-437b-a9e3-e0e6330e2411", "exp": 1771679154, "iat": 1771675554, "iss": "https://replit.com/oidc", "sub": "55085462", "email": "benvanscyoc@gmail.com", "at_hash": "wY-ajlB4KBXa5k4BKUudLQ", "username": "benvanscyoc", "auth_time": 1771667068, "last_name": "Van Scyoc", "first_name": "Ben", "email_verified": true}, "expires_at": 1771679154, "access_token": "b0GSooBBhS1nblqOyAkzAHH3h2N7zR4aU9ePV7i9ZYx", "refresh_token": "P2ZVPV8it_oSCY9WbHGgC7dtNjXgmJ9ZueStooZjVZl"}}}	2026-02-28 12:21:15
fdpdHlrFxQgESBSxl0Oyh8m7CIZRnlnM	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T10:03:22.793Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "c73bcfdc-ae1c-437b-a9e3-e0e6330e2411", "exp": 1771671802, "iat": 1771668202, "iss": "https://test-mock-oidc.replit.app/", "jti": "e3264bf6bd0971ed0e30fe1d10f1a371", "sub": "test-user-x51AUN", "email": "testuserPjHF1O@example.com", "auth_time": 1771668202, "last_name": "Pilgrim", "first_name": "Test"}, "expires_at": 1771671802, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzcxNjY4MjAyLCJleHAiOjE3NzE2NzE4MDIsInN1YiI6InRlc3QtdXNlci14NTFBVU4iLCJlbWFpbCI6InRlc3R1c2VyUGpIRjFPQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IlRlc3QiLCJsYXN0X25hbWUiOiJQaWxncmltIn0.ZlOc-2iM0sjdilXIgggEhG4XL0OKJLwHgNtzm_HFOxAmNOuQcCCc2zN_oRumcjlmzAlPJUGX2HQf7vo1mFO05c2p9u8Fn6U2j3cPyHC2D0UssWvoz1oKKUNnsEF7TPa_KwgJQyq7wCGYpo7zYjCKzq0s6_sMqiuSMeyn6kasZmZ0JtPH3EqmRcXFHgMG7WAkaCHOG6bYRbXgZxO8pd6_TjYYVWGiUlpwePG9CYXeOtbS1hnMAtgEdV6e2Z_Fz8MlSPytDOfdrQQmagA34jsIy3iKhrCLnQ3ZHDy-_j_qoj0oIq64w-nLBXB9meOeh2cHjdGLDC4jKoinyjz7cUMxfg", "refresh_token": "eyJzdWIiOiJ0ZXN0LXVzZXIteDUxQVVOIiwiZW1haWwiOiJ0ZXN0dXNlclBqSEYxT0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJUZXN0IiwibGFzdF9uYW1lIjoiUGlsZ3JpbSJ9"}}}	2026-02-28 10:06:12
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) FROM stdin;
55085462	benvanscyoc@gmail.com	Ben	Van Scyoc	\N	2026-02-21 09:44:29.033236	2026-02-21 09:44:29.033236
test-user-x51AUN	testuserPjHF1O@example.com	Test	Pilgrim	\N	2026-02-21 10:03:22.782304	2026-02-21 10:03:22.782304
test-eremos-TqS-Sy	testuserYIQQ_b@example.com	Test	User	\N	2026-02-21 10:36:11.587914	2026-02-21 10:36:11.587914
test-reading-zZx3CM	readerffrPz5@example.com	Reader	Test	\N	2026-02-21 11:00:14.256018	2026-02-21 11:00:14.256018
test-about-KVNHLB	aboutqcI_8V@example.com	About	Tester	\N	2026-02-21 11:15:40.466943	2026-02-21 11:15:40.466943
\.


--
-- Name: checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_items_id_seq', 10, true);


--
-- Name: highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.highlights_id_seq', 2, true);


--
-- Name: mood_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mood_entries_id_seq', 1, true);


--
-- Name: prayer_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prayer_responses_id_seq', 1, false);


--
-- Name: prayer_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prayer_sessions_id_seq', 4, true);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: highlights highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT highlights_pkey PRIMARY KEY (id);


--
-- Name: mood_entries mood_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mood_entries
    ADD CONSTRAINT mood_entries_pkey PRIMARY KEY (id);


--
-- Name: prayer_responses prayer_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prayer_responses
    ADD CONSTRAINT prayer_responses_pkey PRIMARY KEY (id);


--
-- Name: prayer_sessions prayer_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prayer_sessions
    ADD CONSTRAINT prayer_sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- PostgreSQL database dump complete
--

\unrestrict x1ePnhdYbMFI35aYk4MvFMKX9XNBKdTfTZfUhh24qmnyw7tfW2qnmoiYzCIqMje

