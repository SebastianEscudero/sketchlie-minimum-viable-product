import { BlogStructure } from "@/components/blog-structure";
import { BlogSection } from "@/components/blog-section";
import { FaqSection } from "@/components/faq-section";
import { BlogLinks } from "@/components/blog-links";
import { VerMas } from "@/components/ver-mas";
import { LogoSlider } from "@/components/logo-slider";
import { LandingVideo } from "@/components/landing-video";

const LandingPage = () => {
    const faqData = [
        {
            value: "item-0",
            trigger: "¿Qué es una pizarra online?",
            content: "Una pizarra online es una herramienta digital que permite a los usuarios dibujar, escribir, añadir imágenes y colaborar en tiempo real en un espacio virtual. Las pizarras online son ideales para la enseñanza, la presentación de proyectos, la lluvia de ideas y la planificación de tareas."
        },
        {
            value: "item-1",
            trigger: "¿Qué es la Pizarra Online Gratis de Sketchlie?",
            content: "Tal como dice el nombre es un tablero gratis que puedes utilizar a tu gusto, dibuja, enseña, presentale a tus alumnos a tus colegas lo que tu necesites. La pizarra online de Sketchlie es una herramienta gratis que puedes utilizar sin registrarte y sin pagos. Si necesitas más espacio, guardar tus tableros o colaborar con más personas puedes registrarte gratis en Sketchlie."
        },
        {
            value: "item-2",
            trigger: "¿La pizarra online de Sketchlie es grátis?",
            content: "Sí! La herramienta gratis Pizarra Online de Sketchlie es 100% gratis, utiliza este tablero online para todo lo que necesites sin registrate y sin pagos, si necesitas más espacio, guardar tus tableros o colaborar con más personas puedes registrarte gratis en Sketchlie."
        },
        {
            value: "item-3",
            trigger: "¿Cuál es la diferencia con Sketchlie?",
            content: "Pizarra Online es una herramientas gratis de Sketchlie para todos, con la que puedes dibujar, escribir, añadir imágenes. Si necesitas guardar tus tableros, más espacio, subir imágenes o colaborar con más personas puedes registrarte gratis en Sketchlie e importar tu tablero online."
        },
        {
            value: "item-5",
            trigger: "¿Cómo puedo empezar a usar la pizarra online de Sketchlie?",
            content: "Es tan fácil como hacer click en Crear tablero gratis. Tu pizarra online se creará en segundos y toda tu información estará guardada para la proxima vez que quieras acceder a ella. Si necesitas más espacio, guardar tus tableros o colaborar con más personas puedes registrarte gratis en Sketchlie."
        },
        {
            value: "item-6",
            trigger: "¿Puedo usar la pizarra online de Sketchlie para hacer presentaciones?",
            content: "Sí! Sketchlie es ideal para hacer presentaciones, puedes compartir tu pizarra online con otras personas y hacer presentaciones en tiempo real."
        }
    ];
    return ( 
        <div>
            <BlogStructure
                title="Pizarra online gratis"
                description="La pizarra online, más rapida y fácil de usar. Explora tus ideas, enseña a tus alumnos, presenta tus proyectos todo en un solo lugar."
                cta="Crear tablero gratis"
                alt="Pizarra online Image"
                img="/placeholders/linea-de-tiempo.png"
            />
            <LogoSlider />
            <LandingVideo />
            <div className="my-28">
                <BlogSection 
                    title="Organiza tus ideas en minutos, no horas." 
                    text="La Pizarra Online de Sketchlie es más que un tablero online, es un espacio donde personas puedes expresar sus ideas y convertir conceptos en planes de acción. Sea enseñar a tus alumnos, presentar tus proyectos o simplemente dibujar, la pizarra online de Sketchlie es la herramienta perfecta para ti."
                />
            </div>
            <BlogSection 
                title="Como usar la pizarra online de Sketchlie" 
                text="En Sketchlie creemos que la creatividad no debería tener límites. Por eso, hemos creado una pizarra online que es fácil de usar, intuitiva y accesible para todos. Si necesitas ayuda para entender cómo funciona nuestra pizarra online, tenemos un tutorial explicando paso a paso cómo utilizarla."
                img="/placeholders/mapa-conceptual.png"
                side="right"
                link="https://www.sketchlie.com/blog/pizarra-online-tutorial/"
                linkText="Tutorial de pizarra online"
            />

            <BlogSection
                title="¿Necesitas invitar compañeros a tu espacio de trabajo?" 
                text="Si necesitas colaborar en tiempo real con más personas, guardar tus tableros, guardar imágenes, mejorar rendimiento, utilizar plantillas, aprovechar la Inteligencia Artifical para hacer tus diagramas y mucho más registrate en Sketchlie! Es gratis y solo te tomará unos segundos."
                img="/placeholders/improve-performance.png"
                side="right"
                link="https://www.sketchlie.com/auth/register/"
                linkText="Colabora con más personas"
            />
            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 xl:mx-[10%] lg:mx-[7%] md:mx-[5%] mx-[5%] gap-5 md:my-20 my-5">
                <BlogLinks blogTitle="Mapa Conceptual Online" blogImage="/placeholders/mapa-conceptual.png" blogHref="https://www.sketchlie.com/mapa-conceptual/" blogDescription="Descubre cómo desatar tu creatividad y potenciar la colaboración en tiempo real con Sketchlie."/>
                <BlogLinks blogTitle="Mapa de Procesos" blogImage="/placeholders/mapa-de-procesos.png" blogHref="https://www.sketchlie.com/mapas-de-procesos" blogDescription="El mapa de procesos ayuda a los equipos a mapear y implementar mejoras. Registrate hoy con una 3 espacios de trabajo gratuitos para empezar a utilizar la mejor herramienta de mapa de procesos."/>
                <BlogLinks blogTitle="Wireframes" blogImage="/placeholders/wireframe.png" blogHref="https://www.sketchlie.com/wireframe/" blogDescription="Empieza a visualizar tus ideas en minutos con nuestro intuitivo creador de wireframes. Crea esquemas de lo que necesites, desde páginas de inicio hasta formularios y menús, con nuestro creador de wireframes. "/>
            </div>
            <FaqSection accordionData={faqData} sectionTitle="las pizarras online"/>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 xl:mx-[10%] lg:mx-[7%] md:mx-[5%] mx-[5%] gap-5 md:my-10 my-5">
                <VerMas title="Cómo Utilizar una Pizarra Online" href="https://www.sketchlie.com/pizarra-online/que-es-pizarra-online/"/>
                <VerMas title="Beneficios de una Pizarra Online" href="https://www.sketchlie.com/pizarra-online/que-es-pizarra-online/"/>
                <VerMas title="¿Qué es una Pizarra Online?" href="https://www.sketchlie.com/pizarra-online/que-es-pizarra-online/"/>
            </div>
        </div>

     );
}
 
export default LandingPage;