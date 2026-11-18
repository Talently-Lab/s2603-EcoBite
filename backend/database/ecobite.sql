--
-- PostgreSQL database dump
--

\restrict t9bxuL4Oyc7cKV6S6MPHaBjxwgpeIwhNK1dQ9XrBZ45CN3jjPAPhc5IbhkyXkGz

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-18 18:28:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 32809)
-- Name: carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_restaurante integer,
    CONSTRAINT chk_carrito_estado CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'convertido'::character varying, 'abandonado'::character varying, 'eliminado'::character varying])::text[])))
);


ALTER TABLE public.carrito OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 32808)
-- Name: carrito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_id_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_id_seq OWNED BY public.carrito.id;


--
-- TOC entry 219 (class 1259 OID 16940)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    telefono character varying(30),
    direccion character varying(150),
    piso character varying(20),
    departamento character varying(20),
    ciudad character varying(100),
    id_zona integer
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16949)
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cliente_id_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 220
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


--
-- TOC entry 238 (class 1259 OID 32830)
-- Name: detalle_carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_carrito (
    id integer NOT NULL,
    id_carrito integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    CONSTRAINT chk_detalle_carrito_cantidad CHECK ((cantidad > 0))
);


ALTER TABLE public.detalle_carrito OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 32829)
-- Name: detalle_carrito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_carrito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_carrito_id_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 237
-- Name: detalle_carrito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_carrito_id_seq OWNED BY public.detalle_carrito.id;


--
-- TOC entry 221 (class 1259 OID 16950)
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido (
    id integer NOT NULL,
    id_pedido integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.detalle_pedido OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16959)
-- Name: detalle_pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_id_seq OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 222
-- Name: detalle_pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_id_seq OWNED BY public.detalle_pedido.id;


--
-- TOC entry 234 (class 1259 OID 32769)
-- Name: horario_restaurante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario_restaurante (
    id integer NOT NULL,
    id_restaurante integer NOT NULL,
    dia_semana smallint NOT NULL,
    hora_apertura time without time zone NOT NULL,
    hora_cierre time without time zone NOT NULL,
    CONSTRAINT chk_dia_semana CHECK (((dia_semana >= 1) AND (dia_semana <= 7)))
);


ALTER TABLE public.horario_restaurante OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 32768)
-- Name: horario_restaurante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_restaurante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_restaurante_id_seq OWNER TO postgres;

--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 233
-- Name: horario_restaurante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horario_restaurante_id_seq OWNED BY public.horario_restaurante.id;


--
-- TOC entry 223 (class 1259 OID 16960)
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    id_restaurante integer NOT NULL,
    id_zona integer NOT NULL,
    estado_pedido character varying(30) CONSTRAINT pedido_estado_not_null NOT NULL,
    total_pedido numeric(10,2) CONSTRAINT pedido_total_not_null NOT NULL,
    tipo_pago character varying(20) NOT NULL,
    costo_envio numeric(10,2),
    direccion_entrega character varying(255),
    piso_entrega character varying(20),
    departamento_entrega character varying(20),
    indicacion_entrega text,
    hora_aceptacion timestamp without time zone,
    hora_despacho timestamp without time zone,
    calificacion integer,
    plastico_ahorrado numeric(10,2),
    co2_ahorrado numeric(10,2),
    hora_entrega timestamp without time zone,
    id_carrito integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pedido_calificacion_check CHECK (((calificacion IS NULL) OR ((calificacion >= 1) AND (calificacion <= 5)))),
    CONSTRAINT pedido_estado_check CHECK (((estado_pedido)::text = ANY ((ARRAY['pendiente'::character varying, 'en_preparacion'::character varying, 'despachado'::character varying, 'cancelado'::character varying, 'cancelado_demora'::character varying, 'rechazado'::character varying, 'entregado'::character varying, 'no_entregado'::character varying])::text[]))),
    CONSTRAINT pedido_tipo_pago_check CHECK (((tipo_pago)::text = ANY (ARRAY[('efectivo'::character varying)::text, ('tarjeta'::character varying)::text])))
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16975)
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_id_seq OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 224
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- TOC entry 225 (class 1259 OID 16976)
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    id integer NOT NULL,
    id_restaurante integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    categoria character varying(100),
    imagen character varying(255)
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16987)
-- Name: producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_id_seq OWNER TO postgres;

--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 226
-- Name: producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_id_seq OWNED BY public.producto.id;


--
-- TOC entry 227 (class 1259 OID 16988)
-- Name: restaurante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurante (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    nombre character varying(150) NOT NULL,
    telefono character varying(30),
    cuit character varying(20),
    direccion character varying(255),
    descripcion text,
    categoria character varying(100),
    ciudad character varying(100),
    imagen text
);


ALTER TABLE public.restaurante OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16996)
-- Name: restaurante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurante_id_seq OWNER TO postgres;

--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 228
-- Name: restaurante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurante_id_seq OWNED BY public.restaurante.id;


--
-- TOC entry 229 (class 1259 OID 16997)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    contrasena character varying(255) NOT NULL,
    avatar character varying(255),
    rol character varying(30) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    canal_adquisicion character varying(50)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17006)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 230
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 231 (class 1259 OID 17007)
-- Name: zona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zona (
    id integer NOT NULL,
    zona character varying(100) CONSTRAINT zona_nombre_not_null NOT NULL,
    distancia_promedio numeric(10,2) NOT NULL
);


ALTER TABLE public.zona OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17013)
-- Name: zona_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.zona_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.zona_id_seq OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 232
-- Name: zona_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.zona_id_seq OWNED BY public.zona.id;


--
-- TOC entry 4811 (class 2604 OID 32812)
-- Name: carrito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id SET DEFAULT nextval('public.carrito_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 17014)
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 32833)
-- Name: detalle_carrito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_carrito ALTER COLUMN id SET DEFAULT nextval('public.detalle_carrito_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 17015)
-- Name: detalle_pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN id SET DEFAULT nextval('public.detalle_pedido_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 32772)
-- Name: horario_restaurante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_restaurante ALTER COLUMN id SET DEFAULT nextval('public.horario_restaurante_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 17016)
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 17017)
-- Name: producto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto ALTER COLUMN id SET DEFAULT nextval('public.producto_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 17018)
-- Name: restaurante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurante ALTER COLUMN id SET DEFAULT nextval('public.restaurante_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 17019)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 17020)
-- Name: zona id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zona ALTER COLUMN id SET DEFAULT nextval('public.zona_id_seq'::regclass);


--
-- TOC entry 5036 (class 0 OID 32809)
-- Dependencies: 236
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrito (id, id_cliente, estado, fecha_creacion, fecha_actualizacion, id_restaurante) FROM stdin;
6	1	convertido	2026-11-07 15:56:43.288675	2026-11-16 15:51:26.938249	2
3	1	convertido	2026-10-27 00:57:49.072953	2026-10-27 16:16:35.941833	1
7	1	convertido	2026-11-11 20:43:08.412713	2026-11-16 16:09:14.064708	1
8	1	eliminado	2026-11-16 16:11:38.592579	2026-11-16 16:12:15.66289	13
9	1	convertido	2026-11-16 16:16:34.614892	2026-11-16 16:22:25.203536	2
\.


--
-- TOC entry 5019 (class 0 OID 16940)
-- Dependencies: 219
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id, id_usuario, nombre, apellido, telefono, direccion, piso, departamento, ciudad, id_zona) FROM stdin;
2	2	Juan	Perez	2664000002	Calle Belgrano 456	\N	\N	San Luis	2
1	1	Sandra	Casano	2664000001	Av. San Martin 123	2	B	San Luis	\N
\.


--
-- TOC entry 5038 (class 0 OID 32830)
-- Dependencies: 238
-- Data for Name: detalle_carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_carrito (id, id_carrito, id_producto, cantidad) FROM stdin;
1	3	1	2
2	3	2	1
3	6	4	2
5	7	2	1
4	6	5	1
11	9	6	1
12	9	4	1
\.


--
-- TOC entry 5021 (class 0 OID 16950)
-- Dependencies: 221
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido (id, id_pedido, id_producto, cantidad, precio_unitario, subtotal) FROM stdin;
11	8	1	2	8500.00	17000.00
12	8	2	1	7200.00	7200.00
18	13	4	2	9500.00	19000.00
19	13	5	1	8000.00	8000.00
20	14	2	1	7200.00	7200.00
21	15	4	1	9500.00	9500.00
22	15	6	1	3200.00	3200.00
\.


--
-- TOC entry 5034 (class 0 OID 32769)
-- Dependencies: 234
-- Data for Name: horario_restaurante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario_restaurante (id, id_restaurante, dia_semana, hora_apertura, hora_cierre) FROM stdin;
4	1	2	09:00:00	13:59:00
5	1	2	20:00:00	23:59:00
6	1	3	09:00:00	13:59:00
7	1	3	20:00:00	23:59:00
8	1	4	09:00:00	13:59:00
9	1	4	20:00:00	23:59:00
10	1	5	09:00:00	13:59:00
11	1	5	20:00:00	23:59:00
12	1	6	09:00:00	13:59:00
13	1	6	20:00:00	23:59:00
14	1	7	09:00:00	13:59:00
3	1	1	19:00:00	23:59:00
\.


--
-- TOC entry 5023 (class 0 OID 16960)
-- Dependencies: 223
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido (id, id_cliente, id_restaurante, id_zona, estado_pedido, total_pedido, tipo_pago, costo_envio, direccion_entrega, piso_entrega, departamento_entrega, indicacion_entrega, hora_aceptacion, hora_despacho, calificacion, plastico_ahorrado, co2_ahorrado, hora_entrega, id_carrito, fecha_creacion) FROM stdin;
8	1	1	2	entregado	24700.00	efectivo	500.00	Calle Ejemplo 123	\N	\N	Tocar timbre	2026-10-28 01:14:23.547963	2026-10-28 01:30:23.547963	5	\N	0.53	2026-10-28 01:40:23.547963	3	2026-10-28 01:13:23.547963
13	1	2	3	entregado	30000.00	efectivo	3000.00	Av. Illia 450	2	A	Tocar timbre del departamento	2026-11-16 15:52:26.938249	2026-11-16 16:02:26.938249	4	\N	0.74	2026-11-16 16:15:26.938249	6	2026-11-16 15:51:26.938249
14	1	1	3	cancelado_demora	10200.00	efectivo	3000.00	Direccion 12, San Luis	1	\N	\N	2026-11-16 16:10:14.064708	\N	\N	\N	0.74	\N	7	2026-11-16 16:09:14.064708
15	1	2	1	en_preparacion	14200.00	tarjeta	1500.00	Direcccion 2, San Luis	\N	\N	\N	2026-11-18 15:33:25.203536	\N	\N	\N	0.32	\N	9	2026-11-18 15:32:25.203536
\.


--
-- TOC entry 5025 (class 0 OID 16976)
-- Dependencies: 225
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto (id, id_restaurante, nombre, descripcion, precio, disponible, categoria, imagen) FROM stdin;
2	1	Ensalada mediterranea	Vegetales frescos, aceitunas y semillas	7200.00	t	Comida	ensalada_mediterranea.jpg
4	2	Parrillada vegetal	Vegetales grillados de temporada	9500.00	t	Comida	parrillada_vegetal.jpg
5	2	Hamburguesa vegetal	Hamburguesa vegetal con pan artesanal	8000.00	t	Comida	hamburguesa_vegetal.jpg
1	1	Bowl de quinoa	Quinoa, vegetales frescos y aderezo de la casa	8500.00	t	Comida	https://res.cloudinary.com/x4imlxoe/image/upload/v1792716956/ecobite/productos/ubkv8bbofcd6cjgnesgy.webp
7	13	Hamburguesa vegetariana	Hamburguesa de lentejas con vegetales	9500.00	t	Hamburguesas	\N
6	2	Jugo natural	Jugo natural de frutas de temporada	3200.00	t	Bebida	jugo_natural.jpg
3	1	Limonada natural	Limonada casera con limon fresco	3000.00	f	Bebida	limonada.jpg
8	1	Hamburguesa clásica	Hamburguesa con carne, lechuga y tomate	8500.00	t	Ha	https://ejemplo.com/hamburguesa.jpg
\.


--
-- TOC entry 5027 (class 0 OID 16988)
-- Dependencies: 227
-- Data for Name: restaurante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurante (id, id_usuario, nombre, telefono, cuit, direccion, descripcion, categoria, ciudad, imagen) FROM stdin;
1	5	Pan de Campo	2664000005	30712345605	Chacabuco 10	Panaderia con ahorro sustentable 	Panaderia artesanal	San Luis	\N
2	6	Hoja y Fuego	2664000006	30798765432	Calle Colon 580	Propuesta de cocina vegetal	Parrilla vegetal	San Luis	\N
9	9	Verde Raíz	2664000009	30712345678	Av. Illia 450	Restaurante de comida saludable y sustentable	Cocina natural	San Luis	\N
13	17	Brote Cocina Viva	2664000017	30712345675	Chacabuco 254	Restaurante de comida saludable y vegana	vegana	San Luis	https://res.cloudinary.com/x4imlxoe/image/upload/v1792717599/ecobite/restaurantes/zai4en4tb1clfqf7bsbp.jpg
\.


--
-- TOC entry 5029 (class 0 OID 16997)
-- Dependencies: 229
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, email, contrasena, avatar, rol, fecha_registro, canal_adquisicion) FROM stdin;
2	cliente2@ecobite.com	$2b$10$nU2EUS.QPimoHfaXkTLVuOWxJpZrHakkN3Eun7eVK8xTq1MKJwgi.	\N	cliente	2026-10-02 11:30:00	Facebook
5	restaurante1@ecobite.com	$2b$10$sMud7TAIzbFzrDD4TfvuPeY/UwAYboi22bktl86VhS/Wel3cGVPAW	\N	restaurante	2026-09-28 16:00:00	Instagram
6	restaurante2@ecobite.com	$2b$10$fcdyFZsov/Mp6qxsFfVL8upHFIDj6Voo56g7PmRxiBtDiFnIPuhRe	\N	restaurante	2026-09-29 12:00:00	Recomendacion
9	restaurante4@ecobite.com	$2b$10$LDCeG.NSYEWX2pUpu24aIuquj.Op0ykCBSOCtbl92GSfR0Jup6cO2	\N	restaurante	2026-10-14 00:18:16.90284	redes_sociales
10	cliente3@ecobite.com	$2b$10$mcJrxPxgxRYDibV/UygtReoQ0FnEqD9wgJqyQCdtyVH2tC1lQ4.Qm	\N	cliente	2026-10-14 00:49:06.990885	redes_sociales
17	restaurante5@ecobite.com	$2b$10$FDF6FTla8DrekaCKfgqz9.NWIw/SKxDR04Its1F/uHB.DTG1hz7bG	\N	restaurante	2026-10-22 18:40:36.446041	facebook
14	administrador1@ecobite.com	$2b$10$R4IQj3cjmX3dFfNVgBNggOESZ27uKO6JQAS/aMQqs2sCc1EPz24nO	\N	administrador	2026-10-19 21:24:01.549394	\N
1	cliente1@ecobite.com	$2b$10$tAA2V4/VqmTlFDk69lOCT.Hp5/VRZgqPD9.tiR2/TUavzGhTWuVnK	\N	cliente	2026-10-01 10:00:00	Instagram
\.


--
-- TOC entry 5031 (class 0 OID 17007)
-- Dependencies: 231
-- Data for Name: zona; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zona (id, zona, distancia_promedio) FROM stdin;
1	Centro	3.00
2	Norte	5.00
3	Sur	7.00
4	Este	4.00
5	Oeste	4.00
\.


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 235
-- Name: carrito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_id_seq', 9, true);


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 220
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_id_seq', 11, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 237
-- Name: detalle_carrito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_carrito_id_seq', 12, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 222
-- Name: detalle_pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_id_seq', 22, true);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 233
-- Name: horario_restaurante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_restaurante_id_seq', 20, true);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 224
-- Name: pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_id_seq', 15, true);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 226
-- Name: producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_id_seq', 8, true);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 228
-- Name: restaurante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restaurante_id_seq', 17, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 230
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 27, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 232
-- Name: zona_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.zona_id_seq', 5, true);


--
-- TOC entry 4851 (class 2606 OID 32823)
-- Name: carrito carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pkey PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 17022)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 32840)
-- Name: detalle_carrito detalle_carrito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_carrito
    ADD CONSTRAINT detalle_carrito_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 17024)
-- Name: detalle_pedido detalle_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 32780)
-- Name: horario_restaurante horario_restaurante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_restaurante
    ADD CONSTRAINT horario_restaurante_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 17026)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 17028)
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 17030)
-- Name: restaurante restaurante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurante
    ADD CONSTRAINT restaurante_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 17032)
-- Name: cliente uq_cliente_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uq_cliente_usuario UNIQUE (id_usuario);


--
-- TOC entry 4856 (class 2606 OID 32842)
-- Name: detalle_carrito uq_detalle_carrito_producto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_carrito
    ADD CONSTRAINT uq_detalle_carrito_producto UNIQUE (id_carrito, id_producto);


--
-- TOC entry 4831 (class 2606 OID 32859)
-- Name: pedido uq_pedido_carrito; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT uq_pedido_carrito UNIQUE (id_carrito);


--
-- TOC entry 4837 (class 2606 OID 17034)
-- Name: restaurante uq_restaurante_cuit; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurante
    ADD CONSTRAINT uq_restaurante_cuit UNIQUE (cuit);


--
-- TOC entry 4839 (class 2606 OID 17036)
-- Name: restaurante uq_restaurante_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurante
    ADD CONSTRAINT uq_restaurante_usuario UNIQUE (id_usuario);


--
-- TOC entry 4841 (class 2606 OID 17038)
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- TOC entry 4843 (class 2606 OID 17040)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 17042)
-- Name: zona zona_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zona
    ADD CONSTRAINT zona_nombre_key UNIQUE (zona);


--
-- TOC entry 4847 (class 2606 OID 17044)
-- Name: zona zona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zona
    ADD CONSTRAINT zona_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 1259 OID 32865)
-- Name: uq_carrito_pendiente_cliente_restaurante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_carrito_pendiente_cliente_restaurante ON public.carrito USING btree (id_cliente, id_restaurante) WHERE (((estado)::text = 'pendiente'::text) AND (id_restaurante IS NOT NULL));


--
-- TOC entry 4868 (class 2606 OID 32860)
-- Name: carrito carrito_id_restaurante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_id_restaurante_fkey FOREIGN KEY (id_restaurante) REFERENCES public.restaurante(id);


--
-- TOC entry 4869 (class 2606 OID 32824)
-- Name: carrito fk_carrito_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT fk_carrito_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- TOC entry 4857 (class 2606 OID 17045)
-- Name: cliente fk_cliente_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- TOC entry 4858 (class 2606 OID 17050)
-- Name: cliente fk_cliente_zona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_zona FOREIGN KEY (id_zona) REFERENCES public.zona(id);


--
-- TOC entry 4870 (class 2606 OID 32843)
-- Name: detalle_carrito fk_detalle_carrito_carrito; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_carrito
    ADD CONSTRAINT fk_detalle_carrito_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 32848)
-- Name: detalle_carrito fk_detalle_carrito_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_carrito
    ADD CONSTRAINT fk_detalle_carrito_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id);


--
-- TOC entry 4859 (class 2606 OID 17055)
-- Name: detalle_pedido fk_detalle_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id);


--
-- TOC entry 4860 (class 2606 OID 17060)
-- Name: detalle_pedido fk_detalle_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id);


--
-- TOC entry 4867 (class 2606 OID 32781)
-- Name: horario_restaurante fk_horario_restaurante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_restaurante
    ADD CONSTRAINT fk_horario_restaurante FOREIGN KEY (id_restaurante) REFERENCES public.restaurante(id) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 32853)
-- Name: pedido fk_pedido_carrito; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id) ON DELETE SET NULL;


--
-- TOC entry 4862 (class 2606 OID 17065)
-- Name: pedido fk_pedido_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id);


--
-- TOC entry 4863 (class 2606 OID 17070)
-- Name: pedido fk_pedido_restaurante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_restaurante FOREIGN KEY (id_restaurante) REFERENCES public.restaurante(id);


--
-- TOC entry 4864 (class 2606 OID 17075)
-- Name: pedido fk_pedido_zona; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_zona FOREIGN KEY (id_zona) REFERENCES public.zona(id);


--
-- TOC entry 4865 (class 2606 OID 17080)
-- Name: producto fk_producto_restaurante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT fk_producto_restaurante FOREIGN KEY (id_restaurante) REFERENCES public.restaurante(id);


--
-- TOC entry 4866 (class 2606 OID 17085)
-- Name: restaurante fk_restaurante_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurante
    ADD CONSTRAINT fk_restaurante_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


-- Completed on 2026-11-18 18:28:45

--
-- PostgreSQL database dump complete
--

\unrestrict t9bxuL4Oyc7cKV6S6MPHaBjxwgpeIwhNK1dQ9XrBZ45CN3jjPAPhc5IbhkyXkGz

