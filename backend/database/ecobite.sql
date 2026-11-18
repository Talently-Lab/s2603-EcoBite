--
-- PostgreSQL database dump
--

\restrict sj3pfamusa6umP6MKAOZ1nnhOvYNtVSmQKYiCbcjUUWQKe0F3ZjsaYtKhVfhUDK

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-18 20:17:58

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
-- TOC entry 5024 (class 0 OID 0)
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
-- TOC entry 5025 (class 0 OID 0)
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
-- TOC entry 5026 (class 0 OID 0)
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
-- TOC entry 5027 (class 0 OID 0)
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
-- TOC entry 5028 (class 0 OID 0)
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
-- TOC entry 5029 (class 0 OID 0)
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
-- TOC entry 5030 (class 0 OID 0)
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
-- TOC entry 5031 (class 0 OID 0)
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
-- TOC entry 5032 (class 0 OID 0)
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
-- TOC entry 5033 (class 0 OID 0)
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
-- TOC entry 5034 (class 0 OID 0)
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


-- Completed on 2026-11-18 20:17:59

--
-- PostgreSQL database dump complete
--

\unrestrict sj3pfamusa6umP6MKAOZ1nnhOvYNtVSmQKYiCbcjUUWQKe0F3ZjsaYtKhVfhUDK

