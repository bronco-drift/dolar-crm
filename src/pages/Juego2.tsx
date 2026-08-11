import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  type Jugador,
  getArchivados,
  getInfoBloqueCerrada,
  getJugadores,
  saveArchivados,
  saveInfoBloqueCerrada,
  saveJugadores,
} from '../lib/storage'
import { emojisDisponibles } from '../lib/emojis'
import { alternarVoz, despertarVoz, hablar, vozActiva, vozDisponible } from '../lib/voz'

type Vista =
  | 'menu'
  | 'garabato'
  | 'memoria'
  | 'describir'
  | 'simultaneo'
  | 'emojis'
  | 'tematico'
  | 'futbol'
  | 'bloque'
  | 'archivados'

// Emojis dibujables: nada de caras sutiles ni banderas.
const EMOJIS = [
  '🐙','🦒','🐢','🦔','🐧','🦩','🐘','🦕','🦋','🐌','🦑','🐝','🦉','🐳','🦖','🐊',
  '🌵','🍄','🌻','🍕','🍔','🍦','🥑','🍉','🥨','🧁','🌮','🍩','☕','🍺',
  '🚲','🚀','⛵','🚁','🛵','🎸','🎺','🥁','📷','⏰','🔑','☂️','👑','🕶️','🧦','👟',
  '🏰','⛺','🗼','🚦','🪑','🛋️','🪜','🧸','🎈','🎁','🧩','⚽','🏀','🪁',
  '🌈','⚡','🔥','❄️','🌙','⭐','🌊','🗻',
]

// Emojis difíciles: se reconocen, pero dibujarlos es otra historia.
const EMOJIS_DIFICILES = [
  '🤹','🧗','🏇','🤸','🏄','🚣','🧘','🤺','🏋️','🪂','🤿','🎠','🎡','🎢','🪩','🎭',
  '🩰','🪄','🧨','🪅','🗿','🛸','🔭','🧬','🦠','🪤','🧯','🧲','⚖️','⛲','🌋','🗽',
  '🎪','⛩️','🛶','🚡','🛰️','⚓','🪝','🧵','🪡','🧶','🪢','🛼','🛹','🪀','🎳','🥌',
  '⛸️','🎿','🛷','👾','🧜','🧛','🧟','🧞','🧙','🥷','🕵️','💂',
]

// Cosas 101: lo más simple del mundo, para entrar en calor.
const COSAS_101 = [
  'Una casa',
  'Un sol',
  'Un gato',
  'Un árbol',
  'Un auto',
  'Un pez',
  'Una flor',
  'Una taza',
  'Una pelota',
  'Una estrella',
  'Un corazón',
  'Una llave',
  'Un zapato',
  'Un sombrero',
  'Un libro',
  'Un reloj',
  'Una silla',
  'Un pájaro',
  'Un barco',
  'Un globo',
  'Un paraguas',
  'La luna',
  'Una nube',
  'Una escalera',
  'Un lápiz',
  'Una tijera',
  'Un teléfono',
  'Una cama',
  'Una puerta',
  'Una ventana',
  'Un martillo',
  'Una botella',
  'Una cuchara',
  'Un hongo',
  'Un cactus',
  'Un dado',
  'Un farol de plaza',
  'Una lámpara',
  'Un espantapájaros',
  'Una bicicleta',
  'Un cohete',
  'Una corona',
  'Una mariposa',
  'Un huevo frito',
  'Una banana',
  'Una manzana',
  'Un helado',
  'Una vela encendida',
  'Un perro',
  'Una montaña',
  'Un ojo',
  'Una mano',
  'Una lámpara de lava',
  'Una pluma',
  'Una pizza',
  'Un regalo',
  'Un boomerang',
  'Un semáforo',
  'Un ancla',
  'Un rayo',
  'Un avión',
  'Un tren',
  'Un satélite',
  'Un castillo',
  'Un mamut',
  'Unos anteojos',
  'Una mochila',
  'Una raqueta',
  'Un yoyo',
  'Un trompo',
  'Una sartén',
  'Un tenedor',
  'Un plato',
  'Una torta',
  'Una dona',
  'Una taza de café',
  'Una cámara de fotos',
  'Una computadora',
  'Un celular',
  'Un sobre',
  'Una brújula',
  'Un faro',
  'Una carpa',
  'Una hoja de árbol',
  'Una piña',
  'Un racimo de uvas',
  'Una zanahoria',
  'Un queso',
  'Un pan',
  'Una hamburguesa',
  'Una morsa',
  'Un elefante',
  'Una tortuga',
  'Una araña',
  'Un cangrejo',
  'Una ballena',
  'Un cerdo',
  'Una vaca',
  'Un calamar',
  'Un sombrero de copa',
  'Una corbata',
  'Un reloj de arena',
  'Una lupa',
  'Un candado',
  'Un timón',
  'Una maceta',
  'Un ventilador',
  'Un termómetro',
  'Una jaula',
  'Un balde',
  'Una carretilla',
  'Un puente',
  'Un iglú',
  'Un molino',
  'Una fogata',
  'Un trineo',
  'Un pincel',
  // ── Animales ──
  'Un león',
  'Un tigre',
  'Un oso',
  'Un mono',
  'Un conejo',
  'Un ratón',
  'Una oveja',
  'Una gallina',
  'Un pato',
  'Un búho',
  'Un zorro',
  'Un ciervo',
  'Un camello',
  'Un koala',
  'Un canguro',
  'Un delfín',
  'Un tiburón',
  'Una medusa',
  'Una abeja',
  'Un escarabajo',
  'Una libélula',
  'Una rana',
  'Un lagarto',
  'Una serpiente',
  'Un murciélago',
  'Una ardilla',
  'Un loro',
  'Un cisne',
  'Un caballito de mar',
  'Un burro',
  // ── Comida ──
  'Una sandía',
  'Una naranja',
  'Un limón',
  'Una frutilla',
  'Una cereza',
  'Una pera',
  'Un durazno',
  'Un coco',
  'Un ají',
  'Un tomate',
  'Una cebolla',
  'Una papa',
  'Un brócoli',
  'Un choclo',
  'Un huevo',
  'Un panqueque',
  'Una galleta',
  'Un chupetín',
  'Un caramelo',
  'Un cupcake',
  'Un pochoclo',
  'Unas papas fritas',
  'Una salchicha',
  'Un plato de sopa',
  'Un frasco de miel',
  // ── Objetos ──
  'Una paleta de pintor',
  'Una regla',
  'Un clip',
  'Un botón',
  'Un peine',
  'Un cepillo de dientes',
  'Un espejo',
  'Un jabón',
  'Una toalla',
  'Un destornillador',
  'Una llave inglesa',
  'Un clavo',
  'Un serrucho',
  'Una pala',
  'Un rastrillo',
  'Una regadera',
  'Una linterna',
  'Un enchufe',
  'Una bombita de luz',
  'Un imán',
  'Una pesa',
  'Una cinta métrica',
  'Un embudo',
  'Un colador',
  'Un rallador',
  'Un abrelatas',
  'Una aguja con hilo',
  'Un alfiler',
  // ── Transporte y lugares ──
  'Un camión',
  'Un colectivo',
  'Una moto',
  'Una patineta',
  'Unos patines',
  'Un helicóptero',
  'Un submarino',
  'Un globo aerostático',
  'Una ambulancia',
  'Un tractor',
  'Una grúa',
  'Una boya',
  'Una cabaña',
  'Una iglesia',
  'Una torre',
  'Una rueda de la fortuna',
  'Un tobogán',
  'Una hamaca',
  // ── Naturaleza ──
  'Un arcoíris',
  'Un copo de nieve',
  'Una gota de agua',
  'Una ola',
  'Un volcán',
  'Una isla',
  'Una palmera',
  'Un pino',
  'Un girasol',
  'Un tulipán',
  'Una rosa',
  'Un trébol',
  'Una estrella de mar',
  'Un caracol de mar',
  // ── Deportes y música ──
  'Una pelota de básquet',
  'Un guante de béisbol',
  'Unos dardos',
  'Un casco',
  'Una medalla',
  'Un trofeo',
  'Un piano',
  'Un barrilete',
  'Un sacapuntas',
  'Un abanico',
  'Un megáfono',
  'Unos binoculares',
  'Un parlante',
  'Una radio',
  // ── Ropa ──
  'Una remera',
  'Un pantalón',
  'Un vestido',
  'Una campera',
  'Una bufanda',
  'Un gorro de lana',
  'Un guante',
  'Una media',
  'Una bota',
  'Un cinturón',
  'Una cartera',
  'Unos lentes de sol',
  'Un reloj pulsera',
]

// Nivel difícil: escenas con varias partes y cosas que no tienen forma.
const COSAS_DIFICILES = [
  'Una bicicleta con su cadena',
  'Un pulpo tocando el piano',
  'Una jirafa con bufanda',
  'Un despertador a cuerda',
  'Un helicóptero apagando un incendio',
  'Una máquina de escribir',
  'Un carrito de supermercado',
  'Un tocadiscos',
  'Una cafetera italiana',
  'Un caballo galopando',
  'Una escalera caracol',
  'Un castillo con foso y puente',
  'Una moto con sidecar',
  'Un pavo real con la cola abierta',
  'Un dragón echando fuego',
  'Un tren cruzando un puente',
  'Un astronauta flotando',
  'Una mano haciendo el signo de ok',
  'Un rostro de perfil',
  'Un pulpo dentro de una pecera',
  'Un ventilador de techo desde abajo',
  'Una jaula con un pájaro adentro',
  'Un pulpo con sombrero de copa',
  'Una orquesta de tres músicos',
  'Un mono colgado de una rama',
  'Un cangrejo con anteojos',
  'Una tortuga con caparazón de ciudad',
  'Un molino con las aspas girando',
  'Una máquina de coser',
  'Un esqueleto de dinosaurio',
  'Un pulpo haciendo malabares',
  'Una cabina telefónica',
  'Un semáforo con tres autos esperando',
  'Un pingüino con corbata',
  'Un barco dentro de una botella',
  // Sin forma: hay que resolverlas con ideas
  'La libertad',
  'El silencio',
  'La nostalgia',
  'El tiempo',
  'La suerte',
  'El miedo',
  'La velocidad',
  'El equilibrio',
  'La curiosidad',
  'El caos',
  'La paciencia',
  'El futuro',
  'La amistad',
  'El aburrimiento',
  'La memoria',
  // ── Escenas con varias partes ──
  'Un pulpo cocinando en cuatro ollas',
  'Una jirafa entrando a un ascensor',
  'Un elefante en una hamaca',
  'Un gato tocando el violín',
  'Un pingüino en el desierto',
  'Un astronauta paseando un perro',
  'Un robot regando plantas',
  'Una tortuga con cohete en el caparazón',
  'Un oso pescando en un río',
  'Una ciudad vista desde un avión',
  'Un mercado con puestos',
  'Una banda tocando en la plaza',
  'Una fila de gente esperando',
  'Un partido con la tribuna llena',
  'Una fábrica con chimeneas',
  'Un puerto con grúas',
  'Un laberinto',
  'Un reloj derritiéndose',
  'Una escalera imposible',
  'Un caballo de ajedrez',
  'Un piano subido con sogas por el balcón',
  'Una bicicleta desarmada',
  'Un motor de auto',
  'Un esqueleto humano',
  'Una mano escribiendo',
  'Un ojo con pestañas y reflejo',
  'Una pareja bailando',
  'Un bebé gateando',
  'Un pulpo jugando al ajedrez consigo mismo',
  'Una casa dada vuelta',
  'Un árbol con raíces al aire',
  'Un espejo reflejando otra cosa',
  'Una sombra que no coincide',
  'Un edificio en construcción',
  'Un choque de dos autos',
  // ── Sin forma: hay que resolverlas con ideas ──
  'La envidia',
  'La rutina',
  'El desorden',
  'La espera',
  'La inflación',
  'El insomnio',
  'La ansiedad',
  'El déjà vu',
  'La injusticia',
  'El progreso',
  'La soledad',
  'El chisme',
  'La esperanza',
  'El destino',
  'La verdad',
  'El secreto',
  'La distancia',
  'El olvido',
  'El vértigo',
  'La gravedad',
]

// Niveles del bloque: se agregan sumando entradas acá.

// Fútbol emoji: tres pistas y a adivinar de quién se trata.
const FUTBOL: { e: string; n: string }[] = [
  { e: '🐐 🇦🇷 🦩', n: 'Lionel Messi' },
  { e: '🇵🇹 🇸🇦 🐪', n: 'Cristiano Ronaldo' },
  { e: '🇫🇷 🐢 👑', n: 'Kylian Mbappé' },
  { e: '🇳🇴 🤖 🧘', n: 'Erling Haaland' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 👐 🎯', n: 'Jude Bellingham' },
  { e: '🇧🇷 ⚡ 🕺', n: 'Vinícius Júnior' },
  { e: '🇪🇸 👶 💎', n: 'Lamine Yamal' },
  { e: '🇵🇱 🏹 🐯', n: 'Robert Lewandowski' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇩🇪 🏹', n: 'Harry Kane' },
  { e: '🇧🇪 🧠 🎯', n: 'Kevin De Bruyne' },
  { e: '🇪🇬 👑 🏹', n: 'Mohamed Salah' },
  { e: '🇺🇾 🦫 🧛', n: 'Luis Suárez' },
  { e: '🇧🇷 🪄 🏥', n: 'Neymar Jr' },
  { e: '🇫🇷 🧉 💇', n: 'Antoine Griezmann' },
  { e: '🇭🇷 🪄 🧙', n: 'Luka Modrić' },
  { e: '🇦🇷 🧤 🤪', n: 'Emiliano Martínez' },
  { e: '🇦🇷 🐂 🐂', n: 'Lautaro Martínez' },
  { e: '🇦🇷 🕷️ 🕸️', n: 'Julián Álvarez' },
  { e: '🇦🇷 🛡️ 🧉', n: 'Rodrigo De Paul' },
  { e: '🇦🇷 🏹 🫶', n: 'Ángel Di María' },
  { e: '🇸🇪 🦁 🥋', n: 'Zlatan Ibrahimović' },
  { e: '🇧🇷 🤙 🤙', n: 'Ronaldinho' },
  { e: '🇧🇷 👑 👑', n: 'Pelé' },
  { e: '🇦🇷 🔟 🌦️', n: 'Diego Maradona' },
  { e: '🇫🇷 🪄 💇', n: 'Zinedine Zidane' },
  { e: '🇧🇷 👑 💇', n: 'Ronaldo Nazário' },
  { e: '🇫🇷 🇸🇦 🩹', n: 'Karim Benzema' },
  { e: '🇰🇷 📸 🤍', n: 'Son Heung-min' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🌶️ 🌶️', n: 'Bukayo Saka' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🧯 🎯', n: 'Phil Foden' },
  { e: '🇵🇹 🪄 🪵', n: 'Bernardo Silva' },
  { e: '🇵🇹 🗣️ 🪄', n: 'Bruno Fernandes' },
  { e: '🇨🇦 ⚡ 🚗', n: 'Alphonso Davies' },
  { e: '🇪🇸 🥽 🪄', n: 'Pedri' },
  { e: '🇪🇸 🥊 🪵', n: 'Gavi' },
  { e: '🇺🇾 🦅 🚀', n: 'Federico Valverde' },
  { e: '🇺🇾 🌪️ 🪵', n: 'Darwin Núñez' },
  { e: '🇨🇴 ⚡ 🦈', n: 'Luis Díaz' },
  { e: '🇨🇴 🏹 🪄', n: 'James Rodríguez' },
  { e: '🇨🇱 🪄 🐕', n: 'Alexis Sánchez' },
  { e: '🇨🇱 👑 💇', n: 'Arturo Vidal' },
  { e: '🇸🇳 ⚡ 🇸🇦', n: 'Sadio Mané' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🧠 👉', n: 'Marcus Rashford' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🪵 🍾', n: 'Jack Grealish' },
  { e: '🇧🇪 🦏 🪵', n: 'Romelu Lukaku' },
  { e: '🇫🇷 🪵 🪵', n: 'Olivier Giroud' },
  { e: '🇮🇹 🧤 🗼', n: 'Gianluigi Donnarumma' },
  { e: '🇩🇪 🧤 🛡️', n: 'Manuel Neuer' },
  { e: '🇧🇪 🧤 🦒', n: 'Thibaut Courtois' },
  // ── Sumados ──
  { e: '🇪🇸 🪄 🇯🇵', n: 'Andrés Iniesta' },
  { e: '🇪🇸 🧠 🎼', n: 'Xavi Hernández' },
  { e: '🇪🇸 🛡️ 🟥', n: 'Sergio Ramos' },
  { e: '🇪🇸 🧤 😇', n: 'Iker Casillas' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🎯 💇', n: 'David Beckham' },
  { e: '🇫🇷 🏹 🇬🇧', n: 'Thierry Henry' },
  { e: '🇮🇹 🧠 🍷', n: 'Andrea Pirlo' },
  { e: '🇮🇹 🐺 👑', n: 'Francesco Totti' },
  { e: '🇮🇹 🛡️ 🔴', n: 'Paolo Maldini' },
  { e: '🇳🇱 🔄 🚬', n: 'Johan Cruyff' },
  { e: '🇳🇱 🧑‍🦲 ⬅️', n: 'Arjen Robben' },
  { e: '🇳🇱 🛡️ 🗿', n: 'Virgil van Dijk' },
  { e: '🇩🇪 🎯 📐', n: 'Toni Kroos' },
  { e: '🇩🇪 🐭 😜', n: 'Thomas Müller' },
  { e: '🇩🇪 🎯 🤸', n: 'Miroslav Klose' },
  { e: '🇩🇪 👑 🧹', n: 'Franz Beckenbauer' },
  { e: '🇨🇴 🐯 🎯', n: 'Radamel Falcao' },
  { e: '🇦🇷 🎩 🐢', n: 'Juan Román Riquelme' },
  { e: '🇦🇷 🦁 💥', n: 'Gabriel Batistuta' },
  { e: '🇦🇷 🥷 🎮', n: 'Sergio Agüero' },
  { e: '🇦🇷 🪖 💪', n: 'Carlos Tevez' },
  { e: '🇦🇷 🛡️ 👨‍✈️', n: 'Javier Mascherano' },
  { e: '🇦🇷 🎭 💎', n: 'Paulo Dybala' },
  { e: '🇦🇷 🧠 🎯', n: 'Enzo Fernández' },
  { e: '🇦🇷 🛡️ 😤', n: 'Cristian Romero' },
  { e: '🇪🇸 👶 🏹', n: 'Fernando Torres' },
  { e: '🇪🇸 🏹 ⚔️', n: 'David Villa' },
  { e: '🇪🇸 🎯 🤫', n: 'Raúl González' },
  { e: '🇪🇸 🧠 🎹', n: 'Rodri' },
  { e: '🇧🇷 💥 🦵', n: 'Roberto Carlos' },
  { e: '🇧🇷 🏃 ➡️', n: 'Cafú' },
  { e: '🇧🇷 🙏 ⚡', n: 'Kaká' },
  { e: '🇧🇷 🍌 ➡️', n: 'Dani Alves' },
  { e: '🇧🇷 🛡️ 👑', n: 'Thiago Silva' },
  { e: '🇧🇷 🧤 🧱', n: 'Alisson Becker' },
  { e: '🇧🇷 🧤 🦶', n: 'Ederson' },
  { e: '🇧🇷 🕊️ 🦵', n: 'Garrincha' },
  { e: '🇧🇷 🎯 🎉', n: 'Romário' },
  { e: '🇧🇷 🍼 🎯', n: 'Bebeto' },
  { e: '🇫🇷 🐜 🔋', n: "N'Golo Kanté" },
  { e: '🇫🇷 💇 🕺', n: 'Paul Pogba' },
  { e: '🇫🇷 ⚡ 🤸', n: 'Ousmane Dembélé' },
  { e: '🇲🇦 ⚡ ➡️', n: 'Achraf Hakimi' },
  { e: '🇳🇬 🎭 ⚡', n: 'Victor Osimhen' },
  { e: '🇬🇪 🪄 🍕', n: 'Khvicha Kvaratskhelia' },
  { e: '🇳🇴 🧠 🎯', n: 'Martin Ødegaard' },
  { e: '🇵🇹 ⚡ 🎧', n: 'Rafael Leão' },
  { e: '🇩🇪 🕺 ⚡', n: 'Jamal Musiala' },
  { e: '🇭🇺 🎖️ 🎯', n: 'Ferenc Puskás' },
  { e: '🇵🇹 🐆 👑', n: 'Eusébio' },
  { e: '🇷🇺 🧤 🕷️', n: 'Lev Yashin' },
]

// Generador con semilla: el mismo número reproduce el mismo dibujo,
// así se puede repetir una figura más adelante y comparar.
function prng(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const nuevaSemilla = () => Math.floor(Math.random() * 9000) + 1000

// ── Luz de borde: alerta que entra por los cantos de la pantalla ──
function LuzBorde({ tipo }: { tipo: 'verde' | 'rojo' | null }) {
  if (!tipo) return null
  return (
    <div className={`luz-borde luz-${tipo}`} aria-hidden="true">
      <span className="luz-lado luz-izq" />
      <span className="luz-lado luz-der" />
      <span className="luz-marco" />
    </div>
  )
}

// ── Cronómetro ──
const PASO = 30
const AVISO = 10

function Cronometro({
  total: inicial = PASO,
  disparo = 0,
}: {
  total?: number
  // Cada vez que cambia, el cronómetro arranca solo (al revelar la consigna).
  disparo?: number
}) {
  const [total, setTotal] = useState(inicial)
  const [quedan, setQuedan] = useState(inicial)
  const [andando, setAndando] = useState(false)
  const [luz, setLuz] = useState<'verde' | 'rojo' | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const verdeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!andando) return
    timer.current = window.setInterval(() => {
      setQuedan((q) => {
        const siguiente = q - 1
        if (siguiente <= 0) {
          setAndando(false)
          setLuz(null)
          pitido()
          return 0
        }
        if (siguiente <= AVISO) setLuz('rojo')
        return siguiente
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [andando])

  useEffect(() => () => clearTimeout(verdeTimer.current), [])

  const arrancar = () => {
    if (andando) {
      setAndando(false)
      setLuz(null)
      return
    }
    const desde = quedan <= 0 ? total : quedan
    setQuedan(desde)
    setAndando(true)
    // Verde: un pulso de arranque que se va solo.
    setLuz(desde <= AVISO ? 'rojo' : 'verde')
    clearTimeout(verdeTimer.current)
    verdeTimer.current = window.setTimeout(
      () => setLuz((l) => (l === 'verde' ? null : l)),
      1700,
    )
  }

  // Arranque automático desde afuera: reinicia y larga.
  useEffect(() => {
    if (!disparo) return
    setQuedan(total)
    setAndando(true)
    setLuz(total <= AVISO ? 'rojo' : 'verde')
    clearTimeout(verdeTimer.current)
    verdeTimer.current = window.setTimeout(
      () => setLuz((l) => (l === 'verde' ? null : l)),
      1700,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disparo])

  // Abajo de un minuto se mueve de a 5 segundos; arriba, de a 30.
  const salto = (v: number) => (v >= 60 ? PASO : 5)

  const ajustar = (dir: 1 | -1) => {
    const delta = dir > 0 ? salto(total) : -salto(total - 1)
    const nuevo = Math.max(5, Math.min(30 * 60, total + delta))
    setTotal(nuevo)
    if (!andando) {
      setQuedan(nuevo)
      setLuz(null)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const poco = quedan <= AVISO && quedan > 0

  return (
    <>
      <LuzBorde tipo={luz} />
      <div className="jp-reloj">
        <div className="jp-reloj-fila">
          <button
            type="button"
            className="jp-mini"
            aria-label="Restar tiempo"
            disabled={total <= 5}
            onClick={() => ajustar(-1)}
          >
            −
          </button>
          <span className={`jp-digitos ${poco ? 'is-poco' : ''}`}>{fmt(quedan)}</span>
          <button
            type="button"
            className="jp-mini"
            aria-label="Sumar tiempo"
            onClick={() => ajustar(1)}
          >
            +
          </button>
          <button type="button" className="btn btn-primary" onClick={arrancar}>
            {andando ? 'Pausar' : quedan === total || quedan === 0 ? 'Arrancar' : 'Seguir'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setAndando(false)
              setQuedan(total)
              setLuz(null)
            }}
          >
            Reiniciar
          </button>
        </div>
        <div className="jp-barra">
          <i className={poco ? 'is-poco' : ''} style={{ width: `${(quedan / total) * 100}%` }} />
        </div>
      </div>
    </>
  )
}

// Sonido: preferencia compartida por todos los modos.
const K_SONIDO = 'dolar-crm:papel-sonido'
let sonidoOn = localStorage.getItem(K_SONIDO) !== 'off'

export const sonidoActivo = () => sonidoOn

function alternarSonido() {
  sonidoOn = !sonidoOn
  localStorage.setItem(K_SONIDO, sonidoOn ? 'on' : 'off')
  return sonidoOn
}

function BotonVoz() {
  const [on, setOn] = useState(vozActiva)
  if (!vozDisponible()) return null
  return (
    <button
      type="button"
      className="jp-sonido jp-voz"
      title={on ? 'Dejar de leer en voz alta' : 'Leer las consignas en voz alta'}
      aria-label={on ? 'Dejar de leer en voz alta' : 'Leer las consignas en voz alta'}
      onClick={(e) => {
        e.stopPropagation()
        const nuevo = alternarVoz()
        setOn(nuevo)
        if (nuevo) despertarVoz()
      }}
    >
      {on ? '🗣️' : '🤐'}
    </button>
  )
}

// La consigna se lee desde el otro lado de la mesa, así que va lo más
// grande posible: el CSS baja un escalón por cada tramo de largo.
const claseLargo = (txt: string | null | undefined) => {
  const n = txt?.length ?? 0
  if (n > 30) return 'is-muy-largo'
  if (n > 16) return 'is-largo'
  return ''
}

function BotonSonido() {
  const [on, setOn] = useState(sonidoOn)
  return (
    <button
      type="button"
      className="jp-sonido"
      title={on ? 'Silenciar' : 'Activar sonido'}
      aria-label={on ? 'Silenciar' : 'Activar sonido'}
      onClick={(e) => {
        e.stopPropagation()
        setOn(alternarSonido())
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}

// Un tono corto para los cambios de consigna.
function tic() {
  tonos([0], 660)
}

// Tres tonos: se acabó el tiempo.
function pitido() {
  tonos([0, 0.28, 0.56], 880)
}

function tonos(tiempos: number[], hz: number) {
  if (!sonidoOn) return
  try {
    const Ctx = window.AudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    for (const t of tiempos) {
      const osc = ctx.createOscillator()
      const gan = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = hz
      gan.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gan.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02)
      gan.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22)
      osc.connect(gan)
      gan.connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.24)
    }
    setTimeout(() => ctx.close(), 1400)
  } catch {
    /* sin audio, sin drama */
  }
}

// ── Previa compartida ───────────────────────────────────────────────
// Pantalla previa de cada juego: los ajustes (tiempo, y acá entran los
// niveles fácil/difícil el día que se sumen a los demás juegos) y el
// Preparados / Listos antes de largar, para que nada empiece de golpe.
function Previa({
  ajustes,
  tiempo,
  setTiempo,
  minTiempo = 5,
  maxTiempo = 30 * 60,
  etiquetaTiempo = 'Tiempo para dibujar',
  sinCuenta,
  onEmpezar,
}: {
  ajustes?: ReactNode
  tiempo?: number
  setTiempo?: (n: number) => void
  minTiempo?: number
  maxTiempo?: number
  etiquetaTiempo?: string
  // Para juegos que ya tienen su propia cuenta (Dibujá los emojis)
  sinCuenta?: boolean
  onEmpezar: () => void
}) {
  const [cuenta, setCuenta] = useState<string | null>(null)
  const seq = useRef(0)
  // Si la previa se desmonta a mitad de cuenta, no larga nada
  useEffect(
    () => () => {
      seq.current++
    },
    [],
  )

  const fmt = (s: number) =>
    s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`
  // Mismos saltos que el cronómetro: de a 5 abajo del minuto, de a 30 arriba
  const salto = (v: number) => (v >= 60 ? 30 : 5)

  const largar = () => {
    despertarVoz()
    if (sinCuenta) {
      onEmpezar()
      return
    }
    const id = ++seq.current
    setCuenta('Preparados')
    tic()
    setTimeout(() => {
      if (seq.current !== id) return
      setCuenta('Listos')
      tic()
      setTimeout(() => {
        if (seq.current !== id) return
        onEmpezar()
      }, 900)
    }, 900)
  }

  if (cuenta)
    return (
      <div className="jp-consigna jp-rafaga">
        <div className="jp-consigna-txt">{cuenta}</div>
      </div>
    )

  return (
    <>
      {ajustes}
      {tiempo != null && setTiempo && (
        <>
          <div className="jp-etiqueta">{etiquetaTiempo}</div>
          <div className="jp-reloj">
            <div className="jp-reloj-fila">
              <button
                type="button"
                className="jp-mini"
                aria-label="Menos tiempo"
                disabled={tiempo <= minTiempo}
                onClick={() => setTiempo(Math.max(minTiempo, tiempo - salto(tiempo - 1)))}
              >
                −
              </button>
              <span className="jp-digitos">{fmt(tiempo)}</span>
              <button
                type="button"
                className="jp-mini"
                aria-label="Más tiempo"
                disabled={tiempo >= maxTiempo}
                onClick={() => setTiempo(Math.min(maxTiempo, tiempo + salto(tiempo)))}
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
      <button type="button" className="btn btn-primary jp-empezar" onClick={largar}>
        Empezar
      </button>
    </>
  )
}

// ── Marcador de jugadores ──
function Marcador({
  jugadores,
  guardar,
}: {
  jugadores: Jugador[]
  guardar: (js: Jugador[]) => void
}) {
  const cambiar = (i: number, cambio: Partial<Jugador>) =>
    guardar(jugadores.map((j, k) => (k === i ? { ...j, ...cambio } : j)))

  return (
    <section className="jp-jugadores">
      {jugadores.map((j, i) => (
        <div className="jp-jug" key={i}>
          <input
            value={j.nombre}
            aria-label={`Nombre del jugador ${i + 1}`}
            onChange={(e) => cambiar(i, { nombre: e.target.value })}
          />
          <button
            type="button"
            className="jp-mini"
            aria-label="Restar punto"
            onClick={() => cambiar(i, { puntos: Math.max(0, j.puntos - 1) })}
          >
            −
          </button>
          <span className="jp-pts">{j.puntos}</span>
          <button
            type="button"
            className="jp-mini"
            aria-label="Sumar punto"
            onClick={() => cambiar(i, { puntos: j.puntos + 1 })}
          >
            +
          </button>
          {jugadores.length > 2 && (
            <button
              type="button"
              className="jp-quitar"
              aria-label="Quitar jugador"
              onClick={() => guardar(jugadores.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <div className="jp-jug-acciones">
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            guardar([...jugadores, { nombre: `Jugador ${jugadores.length + 1}`, puntos: 0 }])
          }
        >
          + Jugador
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => guardar(jugadores.map((j) => ({ ...j, puntos: 0 })))}
        >
          Poner en cero
        </button>
      </div>
    </section>
  )
}

// ── Inventario interino ─────────────────────────────────────────────
// Pantallazo completo de los bancos de cosas para auditar contenido:
// KPIs, filtros por juego / nivel / categoría y la tabla entera.
// Vive en Juegos archivados hasta que deje de hacer falta.
function bancosInventario() {
  const filas: { juego: string; nivel: string; cat: string; cosa: string }[] = []
  const meter = (juego: string, nivel: string, cat: string, items: string[]) =>
    items.forEach((cosa) => filas.push({ juego, nivel, cat, cosa }))

  meter('Cosas', 'Fácil', 'general', COSAS_101)
  meter('Cosas', 'Difícil', 'general', COSAS_DIFICILES)
  for (const [cat, items] of Object.entries(TEMATICOS.argentina.banco))
    meter('🇦🇷 Argentina', 'Fácil', cat, items)
  meter('🇦🇷 Argentina', 'Difícil', 'general', BLOQUE_ARG_DIFICIL)
  for (const [cat, items] of Object.entries(TEMATICOS.venezuela.banco))
    meter('🇻🇪 Venezuela', 'Fácil', cat, items)
  meter('🇻🇪 Venezuela', 'Difícil', 'general', BLOQUE_VEN_DIFICIL)
  meter('⚽ Fútbol', 'Fácil', 'general', BLOQUE_FUTBOL_FACIL)
  meter('⚽ Fútbol', 'Difícil', 'general', BLOQUE_FUTBOL_DIFICIL)
  meter('🎵 Música', 'Fácil', 'general', BLOQUE_MUSICA_FACIL)
  meter('🎵 Música', 'Difícil', 'general', BLOQUE_MUSICA_DIFICIL)
  meter('🍳 Cocina', 'Fácil', 'general', BLOQUE_COCINA_FACIL)
  meter('🍳 Cocina', 'Difícil', 'general', BLOQUE_COCINA_DIFICIL)
  // Cada uno lo suyo arma la consigna combinando sujeto + situación,
  // así que sus dos piezas entran como categorías propias, sin nivel.
  meter('Cada uno lo suyo', '—', 'sujetos', SUJETOS)
  meter('Cada uno lo suyo', '—', 'situaciones', SITUACIONES)
  // Emojis: los niveles curados. Imposible usa todos los del teléfono
  // (~1600), así que no se lista acá.
  meter('😀 Emojis', 'Fácil', 'general', EMOJIS)
  meter('😀 Emojis', 'Difícil', 'general', EMOJIS_DIFICILES)
  return filas
}

function InventarioCosas() {
  const [fJuego, setFJuego] = useState('todos')
  const [fNivel, setFNivel] = useState('todos')
  const [fCat, setFCat] = useState('todas')

  const filas = bancosInventario()

  // Cada cosa y en qué bancos aparece: si está en más de uno, es repetida.
  const veces = new Map<string, string[]>()
  for (const f of filas) {
    const k = f.cosa.toLowerCase().trim()
    veces.set(k, [...(veces.get(k) ?? []), `${f.juego} · ${f.nivel}`])
  }
  const repetidas = [...veces.values()].filter((v) => v.length > 1).length

  const pasa = (f: (typeof filas)[number], sin?: 'juego' | 'nivel' | 'cat') =>
    (sin === 'juego' || fJuego === 'todos' || f.juego === fJuego) &&
    (sin === 'nivel' || fNivel === 'todos' || f.nivel === fNivel) &&
    (sin === 'cat' || fCat === 'todas' || f.cat === fCat)

  const visibles = filas.filter((f) => pasa(f))

  // Cada fila de chips cuenta respetando los otros dos filtros.
  const juegos = [...new Set(filas.map((f) => f.juego))]
  const cuentaJuego = (j: string) =>
    filas.filter((f) => f.juego === j && pasa(f, 'juego')).length
  const cuentaNivel = (n: string) =>
    filas.filter((f) => f.nivel === n && pasa(f, 'nivel')).length
  const cats = [...new Set(filas.filter((f) => pasa(f, 'cat')).map((f) => f.cat))]
  const cuentaCat = (c: string) => filas.filter((f) => f.cat === c && pasa(f, 'cat')).length

  const chipInv = (activo: boolean) => `filtro ${activo ? 'is-active' : ''}`

  return (
    <section className="jp-inv">
      <h3 className="jp-inv-titulo">Inventario de cosas</h3>
      <p className="conv-nota">
        Vista interina para auditar los bancos. Cosas 101 y Bloque de cosas comparten mazo,
        y el nivel Imposible de emojis usa todos los del teléfono, así que no se lista.
      </p>
      <div className="jp-inv-kpis">
        <span>
          <strong>{filas.length}</strong> cosas
        </span>
        <span>
          <strong>{veces.size}</strong> únicas
        </span>
        <span className={repetidas > 0 ? 'is-alerta' : ''}>
          <strong>{repetidas}</strong> repetidas
        </span>
        <span>
          <strong>{visibles.length}</strong> en vista
        </span>
      </div>

      <div className="jp-etiqueta">Juego</div>
      <div className="filtros">
        <button
          type="button"
          className={chipInv(fJuego === 'todos')}
          onClick={() => setFJuego('todos')}
        >
          Todos {filas.filter((f) => pasa(f, 'juego')).length}
        </button>
        {juegos.map((j) => (
          <button
            type="button"
            key={j}
            className={chipInv(fJuego === j)}
            onClick={() => setFJuego(j)}
          >
            {j} {cuentaJuego(j)}
          </button>
        ))}
      </div>

      <div className="jp-etiqueta">Nivel</div>
      <div className="filtros">
        {['todos', 'Fácil', 'Difícil'].map((n) => (
          <button
            type="button"
            key={n}
            className={chipInv(fNivel === n)}
            onClick={() => setFNivel(n)}
          >
            {n === 'todos'
              ? `Todos ${filas.filter((f) => pasa(f, 'nivel')).length}`
              : `${n} ${cuentaNivel(n)}`}
          </button>
        ))}
      </div>

      <div className="jp-etiqueta">Categoría</div>
      <div className="filtros">
        <button
          type="button"
          className={chipInv(fCat === 'todas')}
          onClick={() => setFCat('todas')}
        >
          Todas {filas.filter((f) => pasa(f, 'cat')).length}
        </button>
        {cats.map((c) => (
          <button
            type="button"
            key={c}
            className={chipInv(fCat === c)}
            onClick={() => setFCat(c)}
          >
            {c} {cuentaCat(c)}
          </button>
        ))}
      </div>

      <div className="jp-inv-banco">
        <table className="jp-inv-tabla">
          <tbody>
            {visibles.map((f, i) => {
              const donde = veces.get(f.cosa.toLowerCase().trim()) ?? []
              return (
                <tr key={i}>
                  <td className="jp-inv-num">{i + 1}</td>
                  <td>{f.cosa}</td>
                  <td className="jp-inv-nivel">{f.juego}</td>
                  <td className="jp-inv-nivel">{f.nivel}</td>
                  <td className="jp-inv-nivel">{f.cat === 'general' ? '—' : f.cat}</td>
                  <td className="jp-inv-rep">
                    {donde.length > 1 && (
                      <span title={donde.join(' | ')}>×{donde.length}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Motor de consignas: lo usan "De memoria" y los modos temáticos ──
function JuegoConsignas({
  titulo,
  sub,
  banco,
  nombres,
  segundos = 30,
  jugadores,
  guardar,
}: {
  titulo: string
  sub: string
  banco: Record<string, string[]>
  nombres: Record<string, string>
  segundos?: number
  jugadores: Jugador[]
  guardar: (js: Jugador[]) => void
}) {
  const [cat, setCat] = useState('todas')
  const [ronda, setRonda] = useState(0)
  const [consigna, setConsigna] = useState<{ cat: string; txt: string } | null>(null)
  const usadas = useRef<string[]>([])
  const [disparo, setDisparo] = useState(0)
  const [jugando, setJugando] = useState(false)
  const [tiempo, setTiempo] = useState(segundos)

  const sacar = () => {
    const pool =
      cat === 'todas'
        ? Object.entries(banco).flatMap(([k, v]) => v.map((txt) => ({ cat: k, txt })))
        : banco[cat].map((txt) => ({ cat, txt }))
    let libres = pool.filter((p) => !usadas.current.includes(p.txt))
    if (!libres.length) {
      usadas.current = []
      libres = pool
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadas.current.push(el.txt)
    setConsigna(el)
    setRonda((r) => r + 1)
    setDisparo((d) => d + 1) // el reloj arranca con la consigna
  }

  return (
    <section className="jp-hoja">
      <h2 className="jp-titulo">{titulo}</h2>
      <p className="jp-sub">{sub}</p>

      {!jugando ? (
        <Previa
          tiempo={tiempo}
          setTiempo={setTiempo}
          ajustes={
            <>
              <div className="jp-etiqueta">De dónde sale la consigna</div>
              <div className="filtros">
                {['todas', ...Object.keys(banco)].map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`filtro ${cat === c ? 'is-active' : ''}`}
                    onClick={() => {
                      setCat(c)
                      usadas.current = []
                    }}
                  >
                    {c === 'todas' ? 'todas' : (nombres[c] ?? c)}
                  </button>
                ))}
              </div>
            </>
          }
          onEmpezar={() => {
            setJugando(true)
            sacar()
          }}
        />
      ) : (
        <>
          <div className="jp-consigna">
            <div className="jp-consigna-cat">
              {consigna ? (nombres[consigna.cat] ?? consigna.cat) : 'esperando'}
            </div>
            <div className={`jp-consigna-txt ${claseLargo(consigna?.txt)}`}>
              {consigna?.txt ?? 'Sacá una consigna'}
            </div>
          </div>
          <div className="jp-codigo">ronda {consigna ? ronda : '—'}</div>

          <div className="jp-acciones">
            <button type="button" className="btn btn-primary" onClick={sacar}>
              Otra consigna
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setJugando(false)}
            >
              Cambiar ajustes
            </button>
          </div>

          <Cronometro key={tiempo} total={tiempo} disparo={disparo} />
        </>
      )}

      <Marcador jugadores={jugadores} guardar={guardar} />
    </section>
  )
}

// ── 01 · Garabato ──
function trazoGarabato(semilla: number, dificultad: number) {
  const r = prng(semilla)
  const W = 640
  const H = 340
  const m = 55
  const cant = [5, 7, 10][dificultad - 1]
  const pts: [number, number][] = []
  for (let i = 0; i < cant; i++) pts.push([m + r() * (W - 2 * m), m + r() * (H - 2 * m)])
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  const t = dificultad === 1 ? 0.14 : dificultad === 2 ? 0.26 : 0.42
  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[j - 1] || pts[j]
    const p1 = pts[j]
    const p2 = pts[j + 1]
    const p3 = pts[j + 2] || pts[j + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return { d, W, H }
}

// ── 03 · Figura para describir ──
function figuraSvg(semilla: number, nFormas: number) {
  const r = prng(semilla)
  const W = 640
  const H = 420
  const m = 55
  const tipos = ['circulo', 'cuadrado', 'triangulo', 'linea', 'arco', 'zigzag', 'cruz', 'estrella']
  const partes: string[] = []
  for (let i = 0; i < nFormas; i++) {
    const tipo = tipos[Math.floor(r() * tipos.length)]
    const cx = m + r() * (W - 2 * m)
    const cy = m + r() * (H - 2 * m)
    const s = 32 + r() * 76
    const rot = Math.floor(r() * 360)
    let g = ''
    if (tipo === 'circulo') g = `<circle cx="0" cy="0" r="${(s / 2).toFixed(1)}"/>`
    else if (tipo === 'cuadrado')
      g = `<rect x="${(-s / 2).toFixed(1)}" y="${(-s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${(s * (0.6 + r() * 0.8)).toFixed(1)}"/>`
    else if (tipo === 'triangulo')
      g = `<path d="M 0 ${(-s / 2).toFixed(1)} L ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} L ${(-s / 2).toFixed(1)} ${(s / 2).toFixed(1)} Z"/>`
    else if (tipo === 'linea')
      g = `<line x1="${(-s).toFixed(1)}" y1="0" x2="${s.toFixed(1)}" y2="0"/>`
    else if (tipo === 'arco')
      g = `<path d="M ${(-s / 2).toFixed(1)} 0 A ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} 0 0 1 ${(s / 2).toFixed(1)} 0"/>`
    else if (tipo === 'zigzag') {
      let d = `M ${(-s).toFixed(1)} 0`
      const dx = (2 * s) / 4
      for (let z = 1; z <= 4; z++)
        d += ` L ${(-s + dx * z).toFixed(1)} ${(z % 2 ? -s / 2.4 : s / 2.4).toFixed(1)}`
      g = `<path d="${d}"/>`
    } else if (tipo === 'cruz')
      g = `<line x1="${(-s / 2).toFixed(1)}" y1="0" x2="${(s / 2).toFixed(1)}" y2="0"/><line x1="0" y1="${(-s / 2).toFixed(1)}" x2="0" y2="${(s / 2).toFixed(1)}"/>`
    else {
      let pd = ''
      const R = s / 2
      const rr = R * 0.42
      for (let k = 0; k < 10; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / 5
        const rad = k % 2 ? rr : R
        pd += `${k ? ' L ' : 'M '}${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`
      }
      g = `<path d="${pd} Z"/>`
    }
    partes.push(
      `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${rot})" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${g}</g>`,
    )
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figura para describir">${partes.join('')}</svg>`
}

const BANCO: Record<string, string[]> = {
  objetos: [
    'Una bicicleta completa',
    'Un sacacorchos de dos brazos',
    'Una cafetera italiana',
    'Un mate con bombilla',
    'Un teléfono de disco',
    'Un ventilador de techo',
    'Una tijera abierta',
    'Un candado con la llave puesta',
    'Un paraguas abierto',
    'Una guitarra criolla',
    'Una octava de piano con sus teclas negras',
    'Un colectivo de costado',
    'Un avión visto de frente',
    'Una carretilla',
    'Un semáforo con su poste',
    'Un teclado completo con todas sus letras',
    'Un billete con su cara y sus números',
    'Un sacapuntas',
    'Un budare con una arepa encima',
    'Un cuatro venezolano con sus clavijas',
    'Unas maracas',
    'Una licuadora',
    'Un termo de agua caliente',
    'Un abanico de mano abierto',
    'Una plancha de ropa',
    'Un molinillo de café',
    'Una máquina de coser',
    'Un botellón de agua en su dispensador',
  ],
  marcas: [
    'El logo de Nike',
    'El logo de Adidas',
    'El logo de Starbucks',
    'El logo de Mercado Libre',
    'El logo de Apple',
    'El escudo de Ferrari',
    'El león de Peugeot',
    'El logo de YPF',
    'El logo de Havanna',
    'El logo de Polar',
    'El logo de Windows',
    'El símbolo de Bluetooth',
    'El logo de Michelin',
    'El logo de Volkswagen',
    'El logo de Harina P.A.N.',
    'El logo de Savoy',
    'El osito de Toronto',
    'El logo de Maltín Polar',
    'El logo de Pepsi',
    'El logo de Zara',
    'El logo del Real Madrid',
    'El escudo del Barcelona',
    'El logo de Netflix',
    'El logo de WhatsApp',
    'El logo de Quilmes',
    'El logo de Movistar',
  ],
  mapas: [
    'El mapa de Argentina',
    'El mapa de Venezuela',
    'El mapa de Sudamérica',
    'El mapa de Italia (dicen que es fácil)',
    'El mapa de África',
    'La red de subtes de Buenos Aires',
    'El Obelisco con la 9 de Julio',
    'La Torre Eiffel',
    'El mapa de España',
    'Esta casa vista desde arriba',
    'La bandera de Brasil',
    'La bandera de Uruguay',
    'El Salto Ángel',
    'El Ávila visto desde Caracas',
    'La bandera de Venezuela con sus estrellas',
    'El tepuy Roraima',
    'La Sagrada Familia',
    'El Coliseo romano',
    'La Estatua de la Libertad',
    'El mapa de México',
    'La bandera de España con su escudo',
    'El Cristo Redentor',
    'Las Cataratas del Iguazú',
    'La Torre de Pisa',
  ],
  bichos: [
    'La cara del de al lado, sin mirarlo',
    'Tu propia cara, sin espejo',
    'Un caballo de perfil',
    'Una vaca entera',
    'Un cangrejo',
    'Un pulpo',
    'Una jirafa de cuerpo entero',
    'Un escarabajo desde arriba',
    'Una mano abierta con las uñas',
    'Un pingüino',
    'Un caracol',
    'Una hormiga con sus seis patas',
    'Un turpial',
    'Una orquídea',
    'Un araguaney florecido',
    'Un oso frontino',
    'Un tucán',
    'Una guacamaya',
    'Un hornero con su nido',
    'Un toro bravo',
    'Un flamenco parado en una pata',
    'Un perezoso colgado',
  ],
}

const NOMBRE_CAT: Record<string, string> = {
  objetos: 'objeto cotidiano',
  marcas: 'marca conocida',
  mapas: 'mapa o lugar',
  bichos: 'ser vivo',
}

// Modos temáticos: mismo motor de consignas, distinto banco.
interface Tematico {
  num: string
  titulo: string
  resumen: string
  sub: string
  segundos: number
  banco: Record<string, string[]>
  nombres: Record<string, string>
}

const TEMATICOS: Record<string, Tematico> = {
  venezuela: {
    num: '10',
    titulo: '🇻🇪 Venezuela',
    resumen: 'Arepas, tepuyes, gaita y todo lo que un venezolano dibuja con los ojos cerrados.',
    sub: 'Si alguien de afuera está jugando, que sufra un rato.',
    segundos: 120,
    banco: {
      comida: [
        'Una arepa rellena, abierta al medio',
        'Una cachapa con queso de mano',
        'Tres tequeños en un plato',
        'Una hallaca con su hoja de plátano',
        'Un pabellón criollo completo',
        'Un tostón con guasacaca',
        'Un pastelito de queso',
        'Un papelón con limón',
        'Una empanada de cazón',
        'Una Toronto',
        'Un tequeyoyo',
        'Un golfeado con queso',
        'Una polar bien fría',
        'Un pan de jamón cortado',
        'Un dulce de lechosa',
        'Un cocuy con su botella',
        'Un cepillado de fresa',
        'Una reina pepiada',
        'Un quesillo tembloroso',
      ],
      lugares: [
        'El Salto Ángel',
        'El Ávila con el teleférico',
        'Los Roques desde arriba',
        'El tepuy Roraima',
        'Los Médanos de Coro',
        'El Puente sobre el Lago de Maracaibo',
        'El relámpago del Catatumbo',
        'La Vinotinto celebrando',
        'El Teleférico de Mérida',
        'Un pueblo de la Colonia Tovar',
        'La Cota Mil un domingo',
        'Choroní con sus palmeras',
        'La Plaza Bolívar con sus ardillas',
        'Isla de Margarita en el mapa',
        'El Parque del Este con su lago',
      ],
      cosas: [
        'Un cuatro venezolano',
        'Unas maracas de capacho',
        'Un budare con la arepa encima',
        'Un paquete de Harina P.A.N.',
        'Una lata de Diablitos',
        'Un botellón de agua',
        'Una planta eléctrica',
        'Un billete de un millón de bolívares',
        'Una gorra de la Vinotinto',
        'Un mango verde con sal',
        'Una mata de plátano',
        'Un anime de fiesta infantil',
        'Un litro de chicha con canela',
      ],
      cultura: [
        'Simón Bolívar a caballo',
        'Un turpial cantando',
        'Un araguaney florecido',
        'Una orquídea',
        'Un gaitero con su furro',
        'Un bailarín de joropo',
        'Los Diablos Danzantes de Yare',
        'Una Miss Venezuela con su corona',
        'Un niño de El Sistema con su violín',
        'La bandera con sus ocho estrellas',
        'Un oso frontino',
        'Un tamborero de San Juan',
        'Simón Díaz con su sombrero',
      ],
    },
    nombres: { comida: 'comida', lugares: 'lugar', cosas: 'objeto', cultura: 'cultura' },
  },
  argentina: {
    num: '11',
    titulo: '🇦🇷 Argentina',
    resumen: 'Mate, asado, Maradona y todo lo que se dibuja con acento porteño.',
    sub: 'Prohibido quejarse de que no sale la vaca.',
    segundos: 120,
    banco: {
      comida: [
        'Un asado completo en la parrilla',
        'Un mate con termo bajo el brazo',
        'Una empanada tucumana con su repulgue',
        'Un alfajor mordido',
        'Un choripán con chimichurri',
        'Una milanesa napolitana',
        'Un fernet con coca',
        'Media docena de facturas',
        'Un pote de dulce de leche',
        'Una picada completa',
        'Un locro humeante',
        'Una porción de fugazzeta',
        'Una provoleta derretida',
        'Un sándwich de miga',
        'Un pancho con papitas',
        'Un vitel toné',
        'Un submarino con medialunas',
      ],
      lugares: [
        'El Obelisco',
        'La Casa Rosada',
        'Caminito con sus casas de colores',
        'La Bombonera llena',
        'El Perito Moreno',
        'Las Cataratas del Iguazú',
        'El fin del mundo en Ushuaia',
        'El Aconcagua',
        'El Congreso',
        'Un colectivo porteño',
        'El Cabildo',
        'La Quebrada de Humahuaca',
        'El Puente de la Mujer',
        'El Rosedal de Palermo',
        'Bariloche con chocolate y nieve',
        'Mar del Plata con sus lobos marinos',
        'El Tren de las Nubes',
      ],
      cosas: [
        'Un bandoneón abierto',
        'Una pelota de fútbol clásica',
        'Un subte con su cartel',
        'Una SUBE',
        'Un billete de mil pesos',
        'Un matambre a la pizza',
        'Un guardapolvo blanco',
        'Un sifón de soda',
        'Una birome',
        'Una escarapela',
        'Un termo Stanley',
        'Una camiseta albiceleste',
        'Un cuaderno Gloria',
      ],
      cultura: [
        'Maradona con la 10',
        'Messi levantando la copa',
        'Carlos Gardel con su sonrisa',
        'Mafalda con su flequillo',
        'Una pareja bailando tango',
        'San Martín cruzando los Andes',
        'El sol de la bandera',
        'Un hincha con la camiseta puesta',
        'Evita saludando',
        'El Gauchito Gil con sus cintas rojas',
        'Charly García con su bigote bicolor',
        'El Eternauta con su máscara',
        'Un payador improvisando',
      ],
    },
    nombres: { comida: 'comida', lugares: 'lugar', cosas: 'objeto', cultura: 'cultura' },
  },
  peliculas: {
    num: '12',
    titulo: '🎬 Películas',
    resumen: 'Escenas, personajes y objetos que todos vimos mil veces en el cine.',
    sub: 'Sin decir el título, obvio.',
    segundos: 120,
    banco: {
      escenas: [
        'La proa del Titanic con los brazos abiertos',
        'La aleta del tiburón acercándose',
        'La bicicleta cruzando la luna',
        'El auto volando con las puertas hacia arriba',
        'La lluvia de meteoritos sobre un dinosaurio',
        'Un cartel de Hollywood en la colina',
        'Una casa volando con globos',
        'Un tipo bailando bajo la lluvia con paraguas',
        'Una pareja corriendo por la playa',
        'Un ring de boxeo con las escaleras del museo',
      ],
      personajes: [
        'Un vaquero del lejano oeste',
        'Un mago con anteojos redondos y cicatriz',
        'Un ogro verde con orejas de trompeta',
        'Un extraterrestre con el dedo brillante',
        'Un vagabundo con bastón y bigotito',
        'Un espía de smoking con pistola',
        'Un arqueólogo con sombrero y látigo',
        'Un payaso asomándose a una alcantarilla',
        'Una princesa con dos rodetes',
        'Un robot amarillo que junta basura',
      ],
      objetos: [
        'Un sable de luz encendido',
        'Un anillo dorado con inscripción',
        'Una varita mágica',
        'Un DeLorean con las puertas abiertas',
        'Una máscara blanca de porcelana',
        'Un carrito de pochoclo',
        'Una claqueta de cine',
        'Un rollo de película desenrollado',
        'Una estatuilla dorada de premio',
        'Un tridente de rey del mar',
      ],
    },
    nombres: { escenas: 'escena', personajes: 'personaje', objetos: 'objeto' },
  },
}

// Consignas del modo simultáneo: sujeto + situación, combinables.
// Poco contenido, muchísimas combinaciones y siempre absurdas.
const SUJETOS = [
  'Un pingüino',
  'Un pulpo',
  'Una jirafa',
  'Un cocodrilo',
  'Un astronauta',
  'Una abuela',
  'Un vampiro',
  'Un robot',
  'Un chef',
  'Un dinosaurio',
  'Una sirena',
  'Un fantasma',
  'Un pirata',
  'Un caballo',
  'Un mimo',
  'Un dentista',
  'Una hormiga',
  'Un yeti',
  'Un mago',
  'Un caracol',
  'Un turpial',
  'Una guacamaya',
  'Un llanero',
  'Un gaitero zuliano',
  'Un bachaquero',
  'Un motorizado',
  'Un torero',
  'Un flamenco',
  'Un gaucho',
  'Un vendedor de empanadas',
  'Un árbitro',
  'Un cura',
]

const SITUACIONES = [
  'tomando mate',
  'andando en monopatín',
  'cortándose el pelo',
  'esperando el colectivo',
  'haciendo yoga',
  'lavando los platos',
  'en una entrevista de trabajo',
  'jugando al tenis',
  'con dolor de muelas',
  'sacándose una selfie',
  'armando un mueble',
  'perdido en el supermercado',
  'bailando tango',
  'pintando una pared',
  'atendiendo el teléfono',
  'en la playa con frío',
  'cocinando un asado',
  'corriendo una maratón',
  'mudándose de casa',
  'aprendiendo a andar en bici',
  'haciendo arepas',
  'bailando joropo',
  'en la cola de la panadería',
  'cargando un botellón de agua',
  'subiendo el Ávila',
  'esperando que vuelva la luz',
  'tocando el cuatro',
  'haciendo una hallaca',
  'bailando flamenco',
  'en una verbena',
  'jugando al dominó',
  'cambiando dólares en la calle',
]

const consignaAlAzar = () =>
  `${SUJETOS[Math.floor(Math.random() * SUJETOS.length)]} ${
    SITUACIONES[Math.floor(Math.random() * SITUACIONES.length)]
  }`

// ── Bancos propios de los bloques temáticos ─────────────────────────
// El nivel fácil de Argentina y Venezuela reutiliza el banco de su juego
// temático; el difícil y los temas nuevos viven acá.
const BLOQUE_ARG_DIFICIL = [
  'La mano de Dios',
  'Un colectivo lleno en hora pico',
  'El Glaciar Perito Moreno desprendiéndose',
  'Un mozo llevando seis pizzas',
  'Un fernet con coca servido con espuma',
  'El Caminito de La Boca',
  'Una milanesa a caballo',
  'Un gaucho revoleando las boleadoras',
  'Un tanguero cantando bajo un farol',
  'Una pareja bailando en la milonga',
  'El Monumento a la Bandera',
  'Una cola para cargar la SUBE',
  'Un choripán chorreando chimichurri',
  'El repulgue de una empanada',
  'Un kiosco abierto a las 3 de la mañana',
  'La Bombonera vista desde adentro',
  'Un cartonero con su carro',
  'Un puesto de flores porteño',
  'Una parrilla con achuras y todo',
  'El Planetario de Buenos Aires',
  'Un hincha abrazado al televisor',
  'La 9 de Julio con siete carriles',
  'Un alfajor triple mordido',
  'Un relator gritando un gol eterno',
  'Messi diciendo qué mirás bobo',
  'El Dibu bailando en el arco',
  'Un colectivero que no te frena',
  'La bombilla tapada en pleno mate',
  'Una parrillada para doce en una mesa para cuatro',
  'Un oficinista corriendo el colectivo',
  'Un asador defendiendo su punto de cocción',
  'Una abuela sirviendo la tercera porción sin preguntar',
  'El gol de Maradona a los ingleses, el bueno',
  'Un plomero que dice que va el lunes',
  'Una pareja discutiendo qué gusto de helado pedir',
  'El subte parado por un paro sorpresa',
  'Un DT despedido a los tres partidos',
  'La cábala del hincha en la final',
  'Un kiosquero dando caramelos de vuelto',
  'Un porteño explicando por qué Buenos Aires es lo más',
  'Una milanesa más grande que el plato',
  'El colectivo 60 doblando como si nada',
  'Un tanguero llorando con la radio',
  'La costanera llena de termos y reposeras',
  'Un turista probando mate amargo y arrepintiéndose',
  'Un carrito de panchos a la madrugada',
  'Un trapito cuidando autos',
  'Un vendedor ambulante en el tren con de todo',
]

const BLOQUE_VEN_DIFICIL = [
  'El relámpago del Catatumbo de noche',
  'Una gaita zuliana con furro, cuatro y tambora',
  'El teleférico de Mérida entre las nubes',
  'Una hallaca a medio amarrar',
  'El metro de Caracas en hora pico',
  'La cruz del Ávila iluminada en diciembre',
  'Un carrito de raspados con sus botellas de colores',
  'Los Diablos Danzantes con sus máscaras',
  'Una mesa de dominó en plena partida',
  'Un chinchorro colgado entre dos palmeras',
  'Una arepera abierta a medianoche',
  'Un autobús por puesto lleno',
  'Un pescador en el Lago de Maracaibo',
  'Un llanero con arpa, cuatro y maracas',
  'Una iguana asoleándose en el parque',
  'Una cola para echar gasolina',
  'Un mango cayendo en un techo de zinc',
  'La Basílica de la Chinita',
  'Un niño empinando un papagayo',
  'Una vendedora de empanadas en la playa',
  'El Obelisco de Barquisimeto',
  'Una parrilla con bollitos y guasacaca',
  'Un juego de bolas criollas',
  'Un apagón con todos alumbrando con el teléfono',
  'Un motorizado esquivando huecos',
  'Un heladero tocando su cornetica',
  'El primo que llegó de Miami con cuatro maletas',
  'Una gallina en el patio de la abuela',
  'Un ventilador de pie en su máxima potencia',
  'El último tequeño de la bandeja y todos mirándolo',
  'Una lora repitiendo groserías',
  'Un chamo bañándose en un aguacero',
  'El taxista cobrando en tres monedas distintas',
  'Un arbolito de Navidad en octubre',
  'La abuela haciendo hallacas y mandando a todos',
  'Un grandeliga bateando un jonrón',
  'El vecino con planta eléctrica que no la presta',
  'Un bautizo con torta de tres pisos',
  'Una guacamaya despertando al edificio entero',
  'Un cuñado experto en todo dando cátedra',
  'La arepa de madrugada después de la fiesta',
  'Un niño pidiendo la bendición por teléfono',
  'El carrito de perros calientes con todas las salsas',
  'Una olla de sancocho para todo el barrio',
  'Un maracucho hablando a todo volumen',
  'El metro cerrando justo cuando llegas',
  'Una cola kilométrica por el pan de jamón en diciembre',
  'Simón Bolívar en todos los billetes',
]

const BLOQUE_FUTBOL_FACIL = [
  'Una pelota de fútbol',
  'Un arco con su red',
  'Una tarjeta roja',
  'Un silbato',
  'Una copa dorada',
  'Unos botines con tapones',
  'Una camiseta con el número 10',
  'Un banderín de córner',
  'Una cancha vista desde arriba',
  'Un arquero volando al ángulo',
  'Un árbitro sacando tarjeta',
  'Una barrera esperando el tiro libre',
  'Un gol de cabeza',
  'Una hinchada con banderas',
  'Un penal a punto de patearse',
  'Un banco de suplentes',
  'Un jugador festejando de rodillas',
  'Una vuelta olímpica con la copa',
  'Un caño',
  'La ola en la tribuna',
  'Un técnico gritando desde el banco',
  'Un alcanzapelotas aburrido',
  'Una chilena',
  'Una tanda de penales',
  'Una pelota pinchada',
  'Un guante de arquero',
  'Una red rota por un golazo',
  'Un escudo de equipo',
  'Una entrada al estadio',
  'Un bombo de la hinchada',
  'Una camiseta firmada',
  'Una medalla de subcampeón',
  'Un dorsal con el nombre mal escrito',
  'Una cancha de barrio con arcos oxidados',
  'Un picadito con buzos como arcos',
  'Un perro entrando a la cancha',
  'Un gol en contra',
  'Un capitán con la cinta',
  'Un línea con su banderín a cuadros',
  'Un penal atajado con la cara',
  'Un festejo con baile ensayado',
  'Una pelota en la terraza del vecino',
  'Un arco sin red',
  'Un botín con los cordones desatados',
  'Una tribuna de madera',
  'Un trofeo de plástico dorado',
  'Una pizarra táctica',
  'Un niño dormido abrazado a la pelota',
]

const BLOQUE_FUTBOL_DIFICIL = [
  'Un fuera de juego marcado con la línea del VAR',
  'El VAR anulando un gol',
  'Una jugada dibujada en la pizarra del técnico',
  'Un hat-trick',
  'Una tapada con la punta de los dedos',
  'Un túnel de jugadores saliendo a la cancha',
  'Un festejo sacándose la camiseta y la amarilla',
  'Una rabona',
  'Un gol olímpico',
  'Un utilero ordenando los conos',
  'Un partido bajo un diluvio',
  'Un hincha escuchando la radio en la tribuna',
  'El quinto penal de la tanda',
  'Un arquero jugando de delantero en el último minuto',
  'Un banderazo en la puerta del hotel',
  'Un suplente congelado de frío en el banco',
  'Una tribuna vacía con un solo hincha',
  'Un cabezazo en el segundo palo',
  'Un árbitro revisando el monitor',
  'Una camiseta intercambiada al final',
  'Un tiro libre por encima de la barrera',
  'Un lateral largo al área',
  'Un gol festejado antes de tiempo y anulado',
  'Un abrazo de todo el equipo en el córner',
  'Un jugador fingiendo un dolor terrible',
  'El VAR dibujando líneas torcidas',
  'Un relator quedándose sin voz en el minuto 90',
  'Un DT comiéndose las uñas en el alargue',
  'Dos camilleros llevándose a uno que ya se curó',
  'Un festejo de Topo Gigio',
  'Todo el equipo pidiendo offside con la mano',
  'Un hincha rezando con la camiseta en la cabeza',
  'El banco de suplentes saltando en el gol',
  'Una tarjeta roja por aplaudir al árbitro',
  'Un debutante con la camiseta hasta las rodillas',
  'La moneda del sorteo perdida en el pasto',
  'Un masajista con la esponja mágica',
  'Un lateral que sube y no baja nunca',
  'El 9 tirándola a las nubes solo frente al arco',
  'Un 0 a 0 con toda la tribuna bostezando',
  'La foto del equipo con uno que salió moviéndose',
  'Un paraguas dado vuelta en la tribuna',
  'Un gol validado por un centímetro',
  'Un arquero adivinando el penal para el otro lado',
  'Un alcanzapelotas haciendo tiempo',
  'Un sombrerito y definición de volea',
  'Una barrera con todos tapándose',
  'Un DT expulsado mirando el partido desde un techo',
]

const BLOQUE_MUSICA_FACIL = [
  'Una guitarra',
  'Un micrófono',
  'Una batería completa',
  'Un piano de cola',
  'Un violín',
  'Unos auriculares',
  'Un parlante gigante',
  'Una nota musical',
  'Un DJ con sus bandejas',
  'Una trompeta',
  'Un acordeón',
  'Unas maracas',
  'Un tambor',
  'Un atril con partitura',
  'Un vinilo girando',
  'Un casete con la cinta salida',
  'Una radio vieja',
  'Una flauta',
  'Un ukelele',
  'Un saxofón',
  'Un cantante de ópera',
  'Un coro cantando',
  'Un karaoke con la letra en pantalla',
  'Una campana',
  'Una pandereta',
  'Un xilófono',
  'Una armónica',
  'Un banjo',
  'Unas castañuelas',
  'Un güiro',
  'Una tuba',
  'Un clarinete',
  'Unos platillos chocando',
  'Un violonchelo',
  'Un cencerro',
  'Un metrónomo',
  'Un bombo legüero',
  'Una corneta de cotillón',
  'Una matraca',
  'Un piano de juguete',
  'Un disco rayado',
  'Una cajita musical con bailarina',
  'Un organillero con su mono',
  'Una guitarra de aire',
  'Un solo de batería con lápices en la mesa',
  'Un cantante de ducha con el shampoo de micrófono',
  'Una flauta de pan',
  'Un gong',
]

const BLOQUE_MUSICA_DIFICIL = [
  'Un director de orquesta transpirando',
  'Un recital con luces y humo',
  'Un bajista que nadie mira',
  'Un violinista tocando en el subte',
  'Un mariachi completo',
  'Una gaita escocesa',
  'Un arpa llanera',
  'Un baterista rompiendo el parche',
  'Un guitarrista afinando de oído',
  'Una banda ensayando en un garage',
  'Un cantante olvidándose la letra',
  'Un solo de guitarra de rodillas',
  'Un piano al que le falta una tecla',
  'Un contrabajo entrando a duras penas en un auto',
  'Un triángulo esperando su momento',
  'Una orquesta sinfónica entera',
  'Un DJ con la multitud con las manos arriba',
  'Un acomodador con linterna en el teatro',
  'Un músico callejero con la gorra llena de monedas',
  'Un coro de iglesia desafinando',
  'Un rockero revoleando la guitarra',
  'Una púa perdida adentro de la guitarra',
  'Un ecualizador con las barras saltando',
  'Un vecino golpeando la pared por el ruido',
  'Un DJ que solo aprieta play y levanta las manos',
  'Un fan llorando en primera fila',
  'Un guardia de recital aburrido con tapones',
  'Una banda tributo con pelucas',
  'Un cantante estirando la última nota una hora',
  'Un pogo con uno buscando su zapatilla',
  'Una orquesta afinando todos a la vez',
  'Un intérprete de señas en pleno tema movido',
  'Un roadie probando el micrófono uno dos uno dos',
  'Un trombonista pegándole al de adelante',
  'Una diva tirando el micrófono al piso',
  'Un coro góspel con túnicas',
  'Un cantautor triste con guitarra y bufanda',
  'Un acomodador dormido en la ópera',
  'Una banda de jazz en un sótano con humo',
  'Un rapero con una cadena gigante',
  'Un tecladista con cinco teclados apilados',
  'Un aplauso en el momento equivocado del concierto',
  'El director apuntando al del triángulo en su gran momento',
  'Una serenata en el balcón equivocado',
  'Un karaoke con uno que se cree Freddie Mercury',
  'Un baterista perdiendo un palillo en pleno solo',
  'Un cuarteto de cuerdas en un casamiento',
  'Un abuelo diciendo que la música de antes era mejor',
]

const BLOQUE_COCINA_FACIL = [
  'Una sartén con un huevo frito',
  'Una olla echando vapor',
  'Un cuchillo de cocina',
  'Una tabla de picar con verduras',
  'Un batidor de mano',
  'Un delantal',
  'Un gorro de chef',
  'Una pizza entera',
  'Una hamburguesa completa',
  'Una torta con velitas',
  'Un rallador de queso',
  'Una cafetera',
  'Una heladera abierta y llena',
  'Un microondas',
  'Una pava silbando',
  'Un colador con fideos',
  'Una empanada',
  'Un sushi',
  'Un taco',
  'Una cuchara de madera',
  'Un panqueque saltando de la sartén',
  'Un bol con masa y la cuchara',
  'Una parrilla con carne',
  'Un helado de tres bochas',
  'Una espátula',
  'Un cucharón',
  'Una olla quemada en remojo',
  'Un tostador escupiendo la tostada',
  'Un frasco imposible de abrir',
  'Un choclo con manteca',
  'Un melón',
  'Un exprimidor de limones',
  'Una docena de huevos',
  'Un salero y un pimentero',
  'Una pila de panqueques con miel',
  'Un pollo entero al horno',
  'Una lata de sardinas',
  'Una cabeza de ajo',
  'Una papa con forma de corazón',
  'Un helado cayéndose del cono',
  'Un espagueti colgando del tenedor',
  'Una hamburguesa que no entra en la boca',
  'Un huevo de doble yema',
  'Una torta con el nombre mal escrito',
  'Un tupper sin su tapa',
  'Una jarra de jugo',
  'Un mantel a cuadros',
  'Un guante de horno',
]

const BLOQUE_COCINA_DIFICIL = [
  'Un chef flambeando con la llama alta',
  'Una cocina de restaurante en pleno servicio',
  'Un soufflé desinflándose',
  'Una masa madre burbujeando en el frasco',
  'Un plato de alta cocina servido con pinzas',
  'Una tortilla dada vuelta por el aire',
  'Un lavaplatos tapado de ollas',
  'Un mozo llevando cinco platos',
  'Una cebolla haciendo llorar a todos',
  'Un pulpo entero en la tabla',
  'Una olla a presión a punto de silbar',
  'Un pan quemado y el humo en la cocina',
  'Una heladera llena de tuppers',
  'Un jurado probando con cara de nada',
  'Una balanza pesando harina',
  'Un delivery llegando con la pizza fría',
  'Una fuente de ñoquis del 29',
  'Un termómetro pinchado en el pavo',
  'Una manga decorando una torta',
  'Un mortero moliendo especias',
  'Una bandeja de facturas',
  'Un fideo pegado en la pared',
  'Un recetario manchado de salsa',
  'Un huevo estrellado fuera de la sartén',
  'Un chef gritando como Gordon Ramsay',
  'Una abuela cocinando sin medir y saliéndole perfecto',
  'Una freidora escupiendo aceite',
  'Un mozo recitando el menú de memoria',
  'Una cocina nevada de harina',
  'Un imán de heladera sosteniendo diez papeles',
  'Un huevo explotando en el microondas',
  'Una ensalada triste de dieta',
  'Una parrilla con un solo chorizo para ocho',
  'Un postre quemado con soplete',
  'La cuchara de palo de mamá en modo amenaza',
  'Un niño lamiendo la olla del dulce',
  'Un panadero a las 4 de la mañana',
  'Una torta derrumbándose en cámara lenta',
  'Un concurso de comer perros calientes',
  'Un brindis que termina en copa rota',
  'Un sushiman cortando a toda velocidad',
  'Una empanada abierta para ver el relleno',
  'Un buffet libre con platos como torres',
  'Una heladera de soltero con una sola mostaza',
  'Un gato mirando fijo el jamón de la mesa',
  'Una receta de la abuela que dice cantidad necesaria',
  'Una cuenta de restaurante que da un infarto',
  'Un delivery buscando el timbre bajo la lluvia',
]

// ── Fuentes del Bloque ──────────────────────────────────────────────
// El motor del bloque es uno solo; cada fuente solo dice de dónde salen
// las cosas. Un bloque temático nuevo es una entrada acá (y si el tema
// ya existe en TEMATICOS, el banco se reutiliza: el contenido vive en
// un solo lugar).
interface FuenteBloque {
  titulo: string
  unidad: string
  pregunta: string
  esEmoji?: boolean
  // Todos juegan a la vez: sin turnos ni veredicto por tarjeta, los
  // puntos se cargan a mano en el marcador.
  paraTodos?: boolean
  // La grilla final llega ya destapada (Cosas 101); si no, se destapa
  // a mano — clave en el bloque de emojis, que es de memoria.
  revelada?: boolean
  // Lee cada cosa en voz alta (solo Cosas 101, como siempre fue)
  conVoz?: boolean
  // Fuentes que comparten banco comparten memoria de repetición
  memoria?: string
  segDefault?: number
  tamanos?: number[]
  niveles?: { id: string; nombre: string }[]
  pool: (nivel: string) => string[]
}

// Fácil / Difícil es el estándar de todos los bloques de cosas.
const NIVELES_2 = [
  { id: 'facil', nombre: 'Fácil' },
  { id: 'dificil', nombre: 'Difícil' },
]

const FUENTES_BLOQUE: Record<string, FuenteBloque> = {
  cosas: {
    // Calentamiento colectivo: todos dibujan a la vez y la grilla
    // final se revela sola para comparar.
    titulo: 'Cosas 101',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    paraTodos: true,
    revelada: true,
    conVoz: true,
    segDefault: 5,
    niveles: NIVELES_2,
    pool: (nivel) => (nivel === 'dificil' ? [...COSAS_DIFICILES] : [...COSAS_101]),
  },
  bloquecosas: {
    // El mismo banco pero competitivo: por turnos, con veredicto en
    // las tarjetas y puntos automáticos.
    titulo: 'Bloque de cosas',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    memoria: 'cosas',
    segDefault: 3,
    niveles: NIVELES_2,
    pool: (nivel) => (nivel === 'dificil' ? [...COSAS_DIFICILES] : [...COSAS_101]),
  },
  emojis: {
    // De memoria por defecto: pasan de a uno, un segundo cada uno, y
    // después se dibujan sin mirar. La grilla queda tapada para
    // comparar al final. También se puede jugar por turnos.
    titulo: 'Bloque de emojis',
    unidad: 'emojis',
    pregunta: 'Cuántos emojis',
    esEmoji: true,
    segDefault: 1,
    tamanos: [6, 12, 24],
    niveles: [
      { id: 'facil', nombre: 'Fácil' },
      { id: 'dificil', nombre: 'Difícil' },
      { id: 'imposible', nombre: 'Imposible' },
    ],
    pool: (nivel) =>
      nivel === 'imposible'
        ? [...emojisDisponibles()]
        : nivel === 'dificil'
          ? [...EMOJIS_DIFICILES]
          : [...EMOJIS],
  },
  argentina: {
    titulo: '🇦🇷 Bloque argentino',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    niveles: NIVELES_2,
    pool: (nivel) =>
      nivel === 'dificil'
        ? [...BLOQUE_ARG_DIFICIL]
        : Object.values(TEMATICOS.argentina.banco).flat(),
  },
  venezuela: {
    titulo: '🇻🇪 Bloque venezolano',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    niveles: NIVELES_2,
    pool: (nivel) =>
      nivel === 'dificil'
        ? [...BLOQUE_VEN_DIFICIL]
        : Object.values(TEMATICOS.venezuela.banco).flat(),
  },
  futbol: {
    titulo: '⚽ Bloque futbolero',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    niveles: NIVELES_2,
    pool: (nivel) => (nivel === 'dificil' ? [...BLOQUE_FUTBOL_DIFICIL] : [...BLOQUE_FUTBOL_FACIL]),
  },
  musica: {
    titulo: '🎵 Bloque musical',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    niveles: NIVELES_2,
    pool: (nivel) => (nivel === 'dificil' ? [...BLOQUE_MUSICA_DIFICIL] : [...BLOQUE_MUSICA_FACIL]),
  },
  cocina: {
    titulo: '🍳 Bloque de cocina',
    unidad: 'cosas',
    pregunta: 'Cuántas cosas',
    niveles: NIVELES_2,
    pool: (nivel) => (nivel === 'dificil' ? [...BLOQUE_COCINA_DIFICIL] : [...BLOQUE_COCINA_FACIL]),
  },
}

export default function Juego2() {
  const [vista, setVista] = useState<Vista>('menu')
  const [archivados, setArchivados] = useState<string[]>(getArchivados)
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  const [jugadores, setJugadores] = useState<Jugador[]>(getJugadores)
  // Previa compartida: todo juego arranca en ajustes, y el tiempo elegido
  // queda para el próximo (es el ritmo de la mesa, no del juego).
  const [jugando, setJugando] = useState(false)
  const [tiempoJuego, setTiempoJuego] = useState(30)
  const guardarJugadores = (js: Jugador[]) => {
    setJugadores(js)
    saveJugadores(js)
  }

  // Modo simultáneo: reparto secreto → todos dibujan → adivinanza
  const [fase, setFase] = useState<'reparto' | 'dibujo' | 'adivinar'>('reparto')
  const [turno, setTurno] = useState(0)
  const [verConsigna, setVerConsigna] = useState(false)
  const [consignas, setConsignas] = useState<string[]>([])
  const [revelado, setRevelado] = useState<number[]>([])
  const [dispS, setDispS] = useState(0)
  // Veredicto por jugador en la revelación: ✓ suma el punto solo
  const [marcasSim, setMarcasSim] = useState<Record<number, 'ok' | 'mal'>>({})

  const cicloSim = (i: number) => {
    const actual = marcasSim[i]
    const siguiente = actual === 'ok' ? 'mal' : actual === 'mal' ? undefined : 'ok'
    const next = { ...marcasSim }
    if (siguiente) next[i] = siguiente
    else delete next[i]
    setMarcasSim(next)
    const delta = (siguiente === 'ok' ? 1 : 0) - (actual === 'ok' ? 1 : 0)
    if (delta !== 0 && jugadores[i]) {
      guardarJugadores(
        jugadores.map((j, ix) =>
          ix === i ? { ...j, puntos: Math.max(0, j.puntos + delta) } : j,
        ),
      )
    }
  }

  // Modo emojis: cuenta regresiva → 3 segundos a la vista → a dibujar
  const [faseE, setFaseE] = useState<'espera' | 'cuenta' | 'mostrando' | 'dibujando'>('espera')
  const [cuentaE, setCuentaE] = useState(3)
  const [emojis, setEmojis] = useState<string[]>([])
  const [repaso, setRepaso] = useState(false)
  const [dispE, setDispE] = useState(0)
  const [cantEmojis, setCantEmojis] = useState(1)

  useEffect(() => {
    if (faseE === 'cuenta') {
      if (cuentaE <= 0) {
        setFaseE('mostrando')
        return
      }
      const t = setTimeout(() => setCuentaE((c) => c - 1), 850)
      return () => clearTimeout(t)
    }
    if (faseE === 'mostrando') {
      const t = setTimeout(() => {
        setFaseE('dibujando')
        setDispE((d) => d + 1)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [faseE, cuentaE])

  const rondaEmojis = () => {
    const elegidos: string[] = []
    while (elegidos.length < cantEmojis) {
      const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      if (!elegidos.includes(e)) elegidos.push(e)
    }
    setEmojis(elegidos)
    setRepaso(false)
    setCuentaE(3)
    setFaseE('cuenta')
  }

  const nuevaRonda = () => {
    const nuevas: string[] = []
    while (nuevas.length < jugadores.length) {
      const c = consignaAlAzar()
      if (!nuevas.includes(c)) nuevas.push(c)
    }
    setConsignas(nuevas)
    setFase('reparto')
    setTurno(0)
    setVerConsigna(false)
    setRevelado([])
    setMarcasSim({})
  }

  // Garabato
  const [dif, setDif] = useState(2)
  const [semillaG, setSemillaG] = useState(nuevaSemilla)
  const [dispG, setDispG] = useState(0)
  const garabato = trazoGarabato(semillaG, dif)

  // Modo temático activo (Venezuela, Argentina, Películas)
  const [tema, setTema] = useState<string | null>(null)

  // Bloque de cosas: una tanda cerrada de 12 o 24, y al final la lista
  const [bloqueTam, setBloqueTam] = useState(12)
  const [segBloque, setSegBloque] = useState(10)
  const [listaBloque, setListaBloque] = useState<string[]>([])
  const [idxBloque, setIdxBloque] = useState(0)
  const [restaBloque, setRestaBloque] = useState(10)
  const [corriendoBloque, setCorriendoBloque] = useState(false)
  const [terminadoBloque, setTerminadoBloque] = useState(false)
  const [pausaBloque, setPausaBloque] = useState(false)
  const [nivelBloque, setNivelBloque] = useState('facil')
  const [reveladasBloque, setReveladasBloque] = useState<number[]>([])
  const [fuenteBloque, setFuenteBloque] = useState<string>('cosas')
  const [luzBloque, setLuzBloque] = useState<'verde' | null>(null)
  const usadosBloque = useRef<Record<string, string[]>>({})
  const bloque = FUENTES_BLOQUE[fuenteBloque] ?? FUENTES_BLOQUE.cosas
  // El bloque de emojis elige modo; el resto lo trae fijo de la fuente
  const [modoEmojis, setModoEmojis] = useState<'todos' | 'turnos'>('todos')
  const sinTurnos = bloque.esEmoji ? modoEmojis === 'todos' : !!bloque.paraTodos

  // Por turnos: uno dibuja la tanda, otro verifica las tarjetas al final
  // y cada ✓ le suma un punto al que dibujó.
  const [turnoBloque, setTurnoBloque] = useState(0)
  const [marcasBloque, setMarcasBloque] = useState<Record<number, 'ok' | 'mal'>>({})
  const [infoBloque, setInfoBloque] = useState(() => !getInfoBloqueCerrada())
  // Pantalla previa: confirma el turno y da aire antes de largar
  const [previaBloque, setPreviaBloque] = useState(false)
  const [cuentaBloque, setCuentaBloque] = useState<string | null>(null)
  const cuentaSeq = useRef(0)

  const largarBloque = () => {
    const id = ++cuentaSeq.current
    setCuentaBloque('Preparados')
    tic()
    setTimeout(() => {
      if (cuentaSeq.current !== id) return
      setCuentaBloque('Listos')
      tic()
      setTimeout(() => {
        if (cuentaSeq.current !== id) return
        setCuentaBloque(null)
        setPreviaBloque(false)
        empezarBloque()
      }, 900)
    }, 900)
  }
  // Si se borraron jugadores, el turno no puede apuntar al vacío.
  const idxTurno = jugadores[turnoBloque] ? turnoBloque : 0
  const nombreTurno = jugadores[idxTurno]?.nombre || `Jugador ${idxTurno + 1}`

  // La tarjeta revelada se toca y cicla: ✓ verde → ✗ roja → neutra.
  // El punto va y viene con la marca, sin botón de "sumar".
  const cicloBloque = (i: number) => {
    const actual = marcasBloque[i]
    const siguiente = actual === 'ok' ? 'mal' : actual === 'mal' ? undefined : 'ok'
    const next = { ...marcasBloque }
    if (siguiente) next[i] = siguiente
    else delete next[i]
    setMarcasBloque(next)
    const delta = (siguiente === 'ok' ? 1 : 0) - (actual === 'ok' ? 1 : 0)
    if (delta !== 0 && jugadores[idxTurno]) {
      guardarJugadores(
        jugadores.map((j, ix) =>
          ix === idxTurno ? { ...j, puntos: Math.max(0, j.puntos + delta) } : j,
        ),
      )
    }
  }

  const empezarBloque = () => {
    // Memoria entre tandas, como en los demás juegos: no se repite una
    // cosa hasta agotar el banco de esa fuente y nivel.
    const clave = `${bloque.memoria ?? fuenteBloque}:${nivelBloque}`
    const pool = bloque.pool(nivelBloque)
    let libres = pool.filter((c) => !(usadosBloque.current[clave] ?? []).includes(c))
    if (libres.length < bloqueTam) {
      usadosBloque.current[clave] = []
      libres = pool
    }
    const elegidas: string[] = []
    while (elegidas.length < bloqueTam && libres.length) {
      elegidas.push(libres.splice(Math.floor(Math.random() * libres.length), 1)[0])
    }
    usadosBloque.current[clave] = [...(usadosBloque.current[clave] ?? []), ...elegidas]
    setListaBloque(elegidas)
    setIdxBloque(0)
    setRestaBloque(segBloque)
    setTerminadoBloque(false)
    setPausaBloque(false)
    setReveladasBloque([])
    setMarcasBloque({})
    setCorriendoBloque(true)
    setLuzBloque('verde')
    setTimeout(() => setLuzBloque(null), 1700)
  }

  useEffect(() => {
    if (!corriendoBloque || pausaBloque) return
    if (restaBloque <= 0) {
      if (idxBloque + 1 >= listaBloque.length) {
        setCorriendoBloque(false)
        setTerminadoBloque(true)
        pitido()
      } else {
        setIdxBloque((i) => i + 1)
        setRestaBloque(segBloque)
        tic()
      }
      return
    }
    const t = setTimeout(() => setRestaBloque((r) => r - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendoBloque, restaBloque, pausaBloque])

  // Si la fuente lo pide, la grilla final llega ya revelada: la
  // animación escalonada la muestra en orden, rapidito.
  useEffect(() => {
    if (terminadoBloque && bloque.revelada)
      setReveladasBloque(listaBloque.map((_, i) => i))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminadoBloque])

  // Lee la cosa en voz alta al aparecer (si la voz está activa). El tic
  // marca el corte; la voz entra después para no pisarse.
  useEffect(() => {
    if (!corriendoBloque || !bloque.conVoz) return
    const item = listaBloque[idxBloque]
    if (!item) return
    const t = setTimeout(() => hablar(item), 260)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendoBloque, idxBloque])

  // Fútbol emoji: pistas primero, nombre después
  const [futbolista, setFutbolista] = useState<{ e: string; n: string } | null>(null)
  const [nombreVisible, setNombreVisible] = useState(false)
  const usadosFutbol = useRef<string[]>([])
  const [dispFut, setDispFut] = useState(0)

  const otroFutbolista = () => {
    let libres = FUTBOL.filter((f) => !usadosFutbol.current.includes(f.n))
    if (!libres.length) {
      usadosFutbol.current = []
      libres = FUTBOL
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadosFutbol.current.push(el.n)
    setFutbolista(el)
    setNombreVisible(false)
    setDispFut((d) => d + 1)
  }

  // Describir
  const [formas, setFormas] = useState(3)
  const [semillaF, setSemillaF] = useState(nuevaSemilla)
  const [tapada, setTapada] = useState(true)
  const [dispF, setDispF] = useState(0)

  const chip = (activo: boolean) => `filtro ${activo ? 'is-active' : ''}`

  // Todos los bloques comparten motor: abrir uno es solo elegir la fuente.
  const abrirBloque = (fuente: string) => {
    cuentaSeq.current++ // corta cualquier cuenta regresiva pendiente
    const f = FUENTES_BLOQUE[fuente] ?? FUENTES_BLOQUE.cosas
    setSegBloque(f.segDefault ?? 10)
    const tams = f.tamanos ?? [12, 24]
    if (!tams.includes(bloqueTam)) setBloqueTam(tams.includes(12) ? 12 : tams[0])
    setFuenteBloque(fuente)
    setCorriendoBloque(false)
    setTerminadoBloque(false)
    setPreviaBloque(false)
    setCuentaBloque(null)
    setListaBloque([])
    setVista('bloque')
  }

  // El menú como datos: cada juego sabe abrirse solo. Sumar uno nuevo es
  // agregar un objeto acá, y el archivado le sale gratis.
  const JUEGOS: { id: string; titulo: string; resumen: string; abrir: () => void }[] = [
    {
      id: 'cosas101',
      titulo: 'Cosas 101',
      resumen:
        'Para entrar en calor, todos a la vez: tanda de 12 o 24 cosas y al final las tarjetas se revelan solas para comparar.',
      abrir: () => abrirBloque('cosas'),
    },
    {
      id: 'bloque-cosas',
      titulo: 'Bloque de cosas',
      resumen:
        'El mismo mazo pero por turnos: uno dibuja la tanda, otro marca ✓ o ✗ en las tarjetas y los puntos se suman solos.',
      abrir: () => abrirBloque('bloquecosas'),
    },
    {
      id: 'bloque-emojis',
      titulo: 'Bloque de emojis',
      resumen:
        'De memoria: pasan de a uno, un segundo cada uno, y se dibujan sin mirar. Tres niveles, del fácil al imposible.',
      abrir: () => abrirBloque('emojis'),
    },
    {
      id: 'bloque-argentina',
      titulo: '🇦🇷 Bloque argentino',
      resumen:
        'La tanda cerrada, pero todo argentino: comida, lugares y cultura del banco de Argentina.',
      abrir: () => abrirBloque('argentina'),
    },
    {
      id: 'bloque-venezuela',
      titulo: '🇻🇪 Bloque venezolano',
      resumen: 'La tanda cerrada versión Venezuela: arepas, Ávila, gaita y apagones.',
      abrir: () => abrirBloque('venezuela'),
    },
    {
      id: 'bloque-futbol',
      titulo: '⚽ Bloque futbolero',
      resumen: 'Todo lo que pasa en una cancha, de la pelota al VAR.',
      abrir: () => abrirBloque('futbol'),
    },
    {
      id: 'bloque-musica',
      titulo: '🎵 Bloque musical',
      resumen: 'Instrumentos y escenas de músico, del ukelele al director transpirado.',
      abrir: () => abrirBloque('musica'),
    },
    {
      id: 'bloque-cocina',
      titulo: '🍳 Bloque de cocina',
      resumen: 'De la sartén con huevo frito al plato de alta cocina con pinzas.',
      abrir: () => abrirBloque('cocina'),
    },
    {
      id: 'garabato',
      titulo: 'Garabato',
      resumen:
        'Todos copian el mismo trazo y lo convierten en un dibujo. Gana la idea más inesperada.',
      abrir: () => setVista('garabato'),
    },
    {
      id: 'memoria',
      titulo: 'De memoria',
      resumen:
        'Dibujar de memoria algo que viste mil veces. Spoiler: nadie sabe dónde va la cadena de la bici.',
      abrir: () => setVista('memoria'),
    },
    {
      id: 'describir',
      titulo: 'Describí y dibujá',
      resumen: 'Uno ve una figura y la describe sin nombrarla. El resto dibuja a ciegas.',
      abrir: () => setVista('describir'),
    },
    {
      id: 'simultaneo',
      titulo: 'Cada uno lo suyo',
      resumen:
        'Cada uno recibe su consigna en secreto y dibuja lo suyo. Al final se revela quién lo hizo bien y los puntos se suman solos.',
      abrir: () => {
        nuevaRonda()
        setVista('simultaneo')
      },
    },
    {
      id: 'emojis',
      titulo: 'Dibujá los emojis',
      resumen: 'Tres emojis aparecen tres segundos y desaparecen. A dibujarlos de memoria, en orden.',
      abrir: () => {
        setFaseE('espera')
        setVista('emojis')
      },
    },
    {
      id: 'futbol',
      titulo: '⚽ Fútbol emoji',
      resumen: 'Tres emojis, un futbolista. El primero que lo grite se lleva el punto.',
      abrir: () => {
        otroFutbolista()
        setVista('futbol')
      },
    },
    ...Object.entries(TEMATICOS).map(([id, t]) => ({
      id: `tema-${id}`,
      titulo: t.titulo,
      resumen: t.resumen,
      abrir: () => {
        setTema(id)
        setVista('tematico')
      },
    })),
  ]

  const activos = JUEGOS.filter((j) => !archivados.includes(j.id))
  const guardados = JUEGOS.filter((j) => archivados.includes(j.id))

  const cambiarEstado = (id: string, estado: 'activo' | 'archivado') => {
    const next =
      estado === 'archivado'
        ? [...archivados.filter((x) => x !== id), id]
        : archivados.filter((x) => x !== id)
    setArchivados(next)
    saveArchivados(next)
    setMenuAbierto(null)
    // Si vaciaste el archivo, no tiene sentido quedarse mirándolo
    if (next.length === 0) setVista('menu')
  }

  const tarjeta = (j: (typeof JUEGOS)[number], num: number) => (
    <div className="jp-card-wrap" key={j.id}>
      <button
        type="button"
        className="jp-card"
        onClick={() => {
          setJugando(false) // todo juego entra por su previa
          j.abrir()
        }}
      >
        <span className="jp-num">{String(num).padStart(2, '0')}</span>
        <span className="jp-card-titulo">{j.titulo}</span>
        <span className="jp-card-txt">{j.resumen}</span>
      </button>
      <button
        type="button"
        className="jp-puntos"
        title="Estado del juego"
        aria-label={`Estado de ${j.titulo}`}
        aria-expanded={menuAbierto === j.id}
        onClick={() => setMenuAbierto((m) => (m === j.id ? null : j.id))}
      >
        ⋯
      </button>
      {menuAbierto === j.id && (
        <div className="jp-estado-menu">
          {(['activo', 'archivado'] as const).map((e) => {
            const esteEstado = archivados.includes(j.id) ? 'archivado' : 'activo'
            return (
              <button
                type="button"
                key={e}
                className={esteEstado === e ? 'is-actual' : ''}
                onClick={() => cambiarEstado(j.id, e)}
              >
                <span>{e === 'activo' ? 'Activo' : 'Archivado'}</span>
                {esteEstado === e && <span className="jp-tilde">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  if (vista === 'menu' || vista === 'archivados') {
    const enArchivo = vista === 'archivados'
    const lista = enArchivo ? guardados : activos
    return (
      <>
        <header className="crm-header">
          {enArchivo ? (
            <button
              type="button"
              className="btn-ghost jp-volver"
              onClick={() => {
                setMenuAbierto(null)
                setVista('menu')
              }}
            >
              ← Todos los juegos
            </button>
          ) : (
            <h1>Juegos de papel</h1>
          )}
        </header>
        {enArchivo ? (
          <h2 className="jp-titulo">Juegos archivados</h2>
        ) : (
          <p className="conv-nota jp-bajada">
            Juegos para una mesa con hojas y lápices. La pantalla solo reparte consignas y
            controla el tiempo.
          </p>
        )}

        {/* Un clic afuera cierra el menú de estado abierto */}
        <div className="jp-menu" onClick={(e) => e.target === e.currentTarget && setMenuAbierto(null)}>
          {lista.map((j, i) => tarjeta(j, i + 1))}

          {enArchivo && lista.length === 0 && (
            <p className="conv-nota">
              No archivaste ninguno. Usá los tres puntos de cada juego para sacarlo del menú
              sin perderlo.
            </p>
          )}

          {!enArchivo && (
            <button
              type="button"
              className="jp-card jp-card-archivo"
              onClick={() => {
                setMenuAbierto(null)
                setVista('archivados')
              }}
            >
              <span className="jp-num">🗂️</span>
              <span className="jp-card-titulo">Juegos archivados</span>
              <span className="jp-card-txt">
                {guardados.length > 0
                  ? `${guardados.length} guardado${guardados.length === 1 ? '' : 's'}: ${guardados
                      .map((g) => g.titulo)
                      .join(', ')}`
                  : 'Nada archivado todavía · adentro está el inventario de cosas'}
              </span>
            </button>
          )}
        </div>

        {enArchivo && <InventarioCosas />}

        {!enArchivo && <Marcador jugadores={jugadores} guardar={guardarJugadores} />}
      </>
    )
  }

  return (
    <>
      <header className="crm-header">
        <button type="button" className="btn-ghost jp-volver" onClick={() => setVista('menu')}>
          ← Todos los juegos
        </button>
      </header>

      {vista === 'garabato' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Garabato</h2>
          <p className="jp-sub">Mismo trazo para todos: cada uno lo convierte en otra cosa.</p>

          {!jugando ? (
            <Previa
              tiempo={tiempoJuego}
              setTiempo={setTiempoJuego}
              ajustes={
                <>
                  <div className="jp-etiqueta">Dificultad</div>
                  <div className="filtros">
                    {[1, 2, 3].map((d) => (
                      <button
                        type="button"
                        key={d}
                        className={chip(dif === d)}
                        onClick={() => setDif(d)}
                      >
                        {['suave', 'normal', 'caos'][d - 1]}
                      </button>
                    ))}
                  </div>
                </>
              }
              onEmpezar={() => {
                setSemillaG(nuevaSemilla())
                setDispG((d) => d + 1)
                setJugando(true)
              }}
            />
          ) : (
            <>
              <div className="jp-lienzo">
                <svg
                  viewBox={`0 0 ${garabato.W} ${garabato.H}`}
                  role="img"
                  aria-label="Garabato"
                >
                  <path
                    d={garabato.d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="jp-codigo">garabato n.º {semillaG}</div>

              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSemillaG(nuevaSemilla())
                    setDispG((d) => d + 1)
                  }}
                >
                  Otro garabato
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setJugando(false)}
                >
                  Cambiar ajustes
                </button>
              </div>

              <Cronometro key={tiempoJuego} total={tiempoJuego} disparo={dispG} />
            </>
          )}
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'memoria' && (
        <JuegoConsignas
          titulo="De memoria"
          sub="Sin mirar nada ni a nadie. Después comparan y se ríen."
          banco={BANCO}
          nombres={NOMBRE_CAT}
          jugadores={jugadores}
          guardar={guardarJugadores}
        />
      )}

      {vista === 'bloque' && (
        <section className="jp-hoja">
          <LuzBorde tipo={luzBloque} />
          <h2 className="jp-titulo">{bloque.titulo}</h2>
          <p className="jp-sub">
            {bloque.esEmoji && sinTurnos
              ? `${bloqueTam} emojis de memoria: pasan de a uno, ${segBloque} segundo${
                  segBloque === 1 ? '' : 's'
                } cada uno, y después se dibujan sin mirar. Al final se destapan para comparar.`
              : `Una tanda cerrada: ${bloqueTam} ${bloque.unidad}, ${segBloque} segundo${
                  segBloque === 1 ? '' : 's'
                } cada uno. Al final aparecen todos juntos.`}
          </p>

          {previaBloque && !corriendoBloque && !terminadoBloque && (
            <>
              <div className="jp-consigna jp-rafaga">
                {cuentaBloque ? (
                  <div className="jp-consigna-txt">{cuentaBloque}</div>
                ) : sinTurnos ? (
                  <>
                    <div className="jp-consigna-cat">dibujan</div>
                    <div className="jp-consigna-txt">Todos</div>
                    <button type="button" className="btn btn-primary" onClick={largarBloque}>
                      Empezar
                    </button>
                  </>
                ) : (
                  <>
                    <div className="jp-consigna-cat">turno de</div>
                    <div className={`jp-consigna-txt ${claseLargo(nombreTurno)}`}>
                      {nombreTurno}
                    </div>
                    {jugadores.length > 1 && (
                      <div className="jp-previa-otros">
                        {jugadores.map(
                          (j, i) =>
                            i !== idxTurno && (
                              <button
                                type="button"
                                key={i}
                                onClick={() => setTurnoBloque(i)}
                              >
                                {j.nombre || `Jugador ${i + 1}`}
                              </button>
                            ),
                        )}
                      </div>
                    )}
                    <button type="button" className="btn btn-primary" onClick={largarBloque}>
                      Empezar
                    </button>
                  </>
                )}
              </div>
              {!cuentaBloque && (
                <div className="jp-acciones">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setPreviaBloque(false)}
                  >
                    Cambiar ajustes
                  </button>
                </div>
              )}
            </>
          )}

          {!previaBloque && !corriendoBloque && !terminadoBloque && (
            <>
              {infoBloque && !sinTurnos && (
                <div className="jp-info">
                  <button
                    type="button"
                    className="jp-info-x"
                    aria-label="Cerrar ayuda"
                    onClick={() => {
                      setInfoBloque(false)
                      saveInfoBloqueCerrada()
                    }}
                  >
                    ×
                  </button>
                  Se juega por turnos: uno dibuja la tanda y al final otro va tocando cada
                  tarjeta — un toque la revela, otro la marca ✓, otro ✗. Cada ✓ suma un
                  punto solo. Los jugadores se agregan en el marcador de abajo.
                </div>
              )}

              {bloque.esEmoji && (
                <>
                  <div className="jp-etiqueta">Modo</div>
                  <div className="filtros">
                    {(
                      [
                        { id: 'todos', nombre: 'Todos a la vez' },
                        { id: 'turnos', nombre: 'Por turnos' },
                      ] as const
                    ).map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        className={chip(modoEmojis === m.id)}
                        onClick={() => {
                          setModoEmojis(m.id)
                          // De memoria alcanza 1 segundo; dibujando, no
                          setSegBloque(m.id === 'todos' ? 1 : 10)
                        }}
                      >
                        {m.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {bloque.niveles && (
                <>
                  <div className="jp-etiqueta">Nivel</div>
                  <div className="filtros">
                    {bloque.niveles.map((n) => (
                      <button
                        type="button"
                        key={n.id}
                        className={chip(nivelBloque === n.id)}
                        onClick={() => setNivelBloque(n.id)}
                      >
                        {n.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="jp-etiqueta">{bloque.pregunta}</div>
              <div className="filtros">
                {(bloque.tamanos ?? [12, 24]).map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={chip(bloqueTam === n)}
                    onClick={() => setBloqueTam(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="jp-etiqueta">Segundos por cosa</div>
              <div className="jp-reloj">
                <div className="jp-reloj-fila">
                  <button
                    type="button"
                    className="jp-mini"
                    aria-label="Menos tiempo"
                    disabled={segBloque <= 1}
                    onClick={() => setSegBloque((s) => Math.max(1, s - 1))}
                  >
                    −
                  </button>
                  <span className="jp-digitos">{segBloque}s</span>
                  <button
                    type="button"
                    className="jp-mini"
                    aria-label="Más tiempo"
                    onClick={() => setSegBloque((s) => Math.min(120, s + 1))}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setPreviaBloque(true)}
                  >
                    Empezar
                  </button>
                </div>
              </div>
            </>
          )}

          {corriendoBloque && (
            <>
              <div className="jp-consigna jp-rafaga">
                <div className="jp-esquina">
                  {bloque.conVoz && <BotonVoz />}
                  <BotonSonido />
                </div>
                <div className="jp-consigna-cat">
                  {idxBloque + 1} de {listaBloque.length}
                </div>
                <div
                  className={`jp-consigna-txt ${
                    bloque.esEmoji ? 'jp-emoji-grande' : claseLargo(listaBloque[idxBloque])
                  }`}
                >
                  {listaBloque[idxBloque]}
                </div>
                <div className={`jp-rafaga-seg ${restaBloque <= 3 ? 'is-poco' : ''}`}>
                  {restaBloque}s
                </div>
              </div>
              <div className="jp-barra">
                <i
                  className={restaBloque <= 3 ? 'is-poco' : ''}
                  style={{ width: `${(restaBloque / segBloque) * 100}%` }}
                />
              </div>
              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPausaBloque((p) => !p)}
                >
                  {pausaBloque ? 'Seguir' : 'Pausar'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIdxBloque((i) => Math.min(listaBloque.length - 1, i + 1))
                    setRestaBloque(segBloque)
                    tic()
                  }}
                >
                  Saltar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setCorriendoBloque(false)
                    setPausaBloque(false)
                    setTerminadoBloque(true)
                  }}
                >
                  Cortar acá
                </button>
              </div>
            </>
          )}

          {terminadoBloque && (
            <>
              <div className="jp-etiqueta">
                {reveladasBloque.length === listaBloque.length
                  ? sinTurnos
                    ? `Las ${listaBloque.length} de la tanda`
                    : `Los ${listaBloque.length} de ${nombreTurno}`
                  : `Tocá para ir descubriendo · ${reveladasBloque.length} de ${listaBloque.length}`}
                {!sinTurnos &&
                  Object.keys(marcasBloque).length > 0 &&
                  ` · ✓ ${Object.values(marcasBloque).filter((m) => m === 'ok').length}`}
              </div>
              <ol className={`jp-bloque-grid ${bloque.revelada ? 'jp-bloque-anim' : ''}`}>
                {listaBloque.map((c, i) => {
                  const abierta = reveladasBloque.includes(i)
                  const marca = sinTurnos ? undefined : marcasBloque[i]
                  return (
                    <li key={i}>
                      {/* La tarjeta entera es el botón: revela, y en modo
                          por turnos después cicla ✓ → ✗ → neutra. */}
                      <button
                        type="button"
                        className={`jp-bloque-celda ${abierta ? 'is-abierta' : ''} ${
                          marca === 'ok' ? 'is-ok' : marca === 'mal' ? 'is-mal' : ''
                        }`}
                        style={bloque.revelada ? { animationDelay: `${i * 70}ms` } : undefined}
                        onClick={() =>
                          abierta
                            ? sinTurnos
                              ? undefined
                              : cicloBloque(i)
                            : setReveladasBloque((r) => (r.includes(i) ? r : [...r, i]))
                        }
                      >
                        <span className="jp-bloque-num">{i + 1}</span>
                        <span
                          className={`jp-bloque-txt ${bloque.esEmoji ? 'jp-bloque-emoji' : ''}`}
                        >
                          {c}
                        </span>
                        {marca && (
                          <span className="jp-bloque-marca">
                            {marca === 'ok' ? '✓' : '✗'}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ol>
              <div className="jp-acciones">
                {reveladasBloque.length < listaBloque.length && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReveladasBloque(listaBloque.map((_, i) => i))}
                  >
                    Revelar todas
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setTerminadoBloque(false)
                    setListaBloque([])
                  }}
                >
                  Cambiar ajustes
                </button>
              </div>
              <button
                type="button"
                className="btn btn-primary jp-siguiente"
                onClick={() => {
                  // Con turnos pasa al siguiente jugador; sin turnos, otra tanda
                  if (!sinTurnos)
                    setTurnoBloque((idxTurno + 1) % Math.max(1, jugadores.length))
                  setTerminadoBloque(false)
                  setListaBloque([])
                  setPreviaBloque(true)
                }}
              >
                {sinTurnos ? 'Otra tanda' : 'Siguiente'}
              </button>
            </>
          )}

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'futbol' && !jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">⚽ Fútbol emoji</h2>
          <p className="jp-sub">
            Tres pistas por jugador: bandera, apodo, manías. El primero que acierta, punto.
          </p>
          <Previa
            tiempo={tiempoJuego}
            setTiempo={setTiempoJuego}
            etiquetaTiempo="Tiempo para adivinar"
            onEmpezar={() => {
              otroFutbolista()
              setJugando(true)
            }}
          />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'futbol' && jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">⚽ Fútbol emoji</h2>
          <p className="jp-sub">
            Tres pistas por jugador: bandera, apodo, manías. El primero que acierta, punto.
          </p>

          <div className="jp-lienzo jp-emojis">
            <div className="jp-emoji-fila jp-futbol-emojis">
              {futbolista?.e.split(' ').map((e, i) => (
                <span key={i}>{e}</span>
              ))}
            </div>
          </div>

          <div className="jp-consigna jp-futbol-nombre">
            {nombreVisible ? (
              <>
                <div className="jp-consigna-cat">era</div>
                <div className={`jp-consigna-txt ${claseLargo(futbolista?.n)}`}>
                  {futbolista?.n}
                </div>
              </>
            ) : (
              <div className="jp-consigna-txt jp-tapado">¿Quién es?</div>
            )}
          </div>

          <div className="jp-acciones">
            {nombreVisible ? (
              <button type="button" className="btn btn-primary" onClick={otroFutbolista}>
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setNombreVisible(true)}
              >
                Revelar
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={otroFutbolista}>
              Paso
            </button>
          </div>

          <Cronometro key={tiempoJuego} total={tiempoJuego} disparo={dispFut} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'tematico' && tema && (
        <JuegoConsignas
          key={tema}
          titulo={TEMATICOS[tema].titulo}
          sub={TEMATICOS[tema].sub}
          banco={TEMATICOS[tema].banco}
          nombres={TEMATICOS[tema].nombres}
          segundos={TEMATICOS[tema].segundos}
          jugadores={jugadores}
          guardar={guardarJugadores}
        />
      )}

      {vista === 'describir' && !jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Describí y dibujá</h2>
          <p className="jp-sub">Solo formas, tamaños y posiciones. Prohibido decir a qué se parece.</p>
          <Previa
            tiempo={tiempoJuego}
            setTiempo={setTiempoJuego}
            ajustes={
              <>
                <div className="jp-etiqueta">Cuántas formas</div>
                <div className="filtros">
                  {[3, 5, 8].map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={chip(formas === n)}
                      onClick={() => setFormas(n)}
                    >
                      {n} · {['suave', 'normal', 'caos'][[3, 5, 8].indexOf(n)]}
                    </button>
                  ))}
                </div>
              </>
            }
            onEmpezar={() => {
              setSemillaF(nuevaSemilla())
              setTapada(true)
              setJugando(true)
            }}
          />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'describir' && jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Describí y dibujá</h2>
          <p className="jp-sub">Solo formas, tamaños y posiciones. Prohibido decir a qué se parece.</p>

          <div className="jp-lienzo">
            <div dangerouslySetInnerHTML={{ __html: figuraSvg(semillaF, formas) }} />
            {tapada && (
              <div className="jp-escudo">
                <strong>Solo mira quien describe</strong>
                <span>Girá la pantalla antes de destapar.</span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setTapada(false)
                    setDispF((d) => d + 1)
                  }}
                >
                  Destapar figura
                </button>
              </div>
            )}
          </div>
          <div className="jp-codigo">
            figura F-{semillaF} · {formas} formas
          </div>

          <div className="jp-acciones">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSemillaF(nuevaSemilla())
                setTapada(true)
              }}
            >
              Figura nueva
            </button>
            {!tapada && (
              <button type="button" className="btn btn-ghost" onClick={() => setTapada(true)}>
                Tapar
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setJugando(false)}
            >
              Cambiar ajustes
            </button>
          </div>

          <Cronometro key={tiempoJuego} total={tiempoJuego} disparo={dispF} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'simultaneo' && !jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Cada uno lo suyo</h2>
          <p className="jp-sub">
            Cada uno dibuja su consigna secreta. Al final, otro marca ✓ o ✗ y los puntos se
            suman solos.
          </p>
          <Previa
            tiempo={tiempoJuego}
            setTiempo={setTiempoJuego}
            onEmpezar={() => {
              nuevaRonda()
              setJugando(true)
            }}
          />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'simultaneo' && jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Cada uno lo suyo</h2>

          {fase === 'reparto' && (
            <>
              <p className="jp-sub">
                Pasá el teléfono. Cada uno mira su consigna sin que nadie más la vea.
              </p>
              <div className="jp-consigna jp-secreto">
                <div className="jp-consigna-cat">
                  {turno + 1} de {jugadores.length}
                </div>
                {verConsigna ? (
                  <>
                    <div className={`jp-consigna-txt ${claseLargo(consignas[turno])}`}>
                      {consignas[turno]}
                    </div>
                    <p className="jp-aviso">Memorizala y pasá el teléfono.</p>
                  </>
                ) : (
                  <div className="jp-consigna-txt">Turno de {jugadores[turno]?.nombre}</div>
                )}
              </div>

              <div className="jp-acciones">
                {verConsigna ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setVerConsigna(false)
                      if (turno + 1 < jugadores.length) setTurno(turno + 1)
                      else {
                        setFase('dibujo')
                        setDispS((d) => d + 1)
                      }
                    }}
                  >
                    {turno + 1 < jugadores.length ? 'Listo, siguiente' : 'Listo, a dibujar'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setVerConsigna(true)}
                    >
                      Ver mi consigna
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setJugando(false)}
                    >
                      Cambiar ajustes
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {fase === 'dibujo' && (
            <>
              <p className="jp-sub">
                Todos dibujan al mismo tiempo, cada uno lo suyo. Sin espiar, sin hablar.
              </p>
              <Cronometro key={tiempoJuego} total={tiempoJuego} disparo={dispS} />
              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setFase('adivinar')}
                >
                  Terminamos, a adivinar
                </button>
              </div>
            </>
          )}

          {fase === 'adivinar' && (
            <>
              <p className="jp-sub">
                Uno muestra su dibujo, el resto tira qué es. Revelá la consigna y tocá la
                fila: ✓ si lo dibujó bien, ✗ si no — el punto se suma solo.
              </p>
              <ul className="jp-revelar">
                {jugadores.map((j, i) => {
                  const marca = marcasSim[i]
                  return (
                    <li key={i}>
                      {revelado.includes(i) ? (
                        // Revelada, la fila entera cicla ✓ → ✗ → neutra
                        <button
                          type="button"
                          className={`jp-revelar-fila jp-revelar-toque ${
                            marca === 'ok' ? 'is-ok' : marca === 'mal' ? 'is-mal' : ''
                          }`}
                          onClick={() => cicloSim(i)}
                        >
                          <span className="jp-revelar-nombre">{j.nombre}</span>
                          <span className="jp-revelar-txt">{consignas[i]}</span>
                          {marca && (
                            <span className="jp-bloque-marca">
                              {marca === 'ok' ? '✓' : '✗'}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="jp-revelar-fila">
                          <span className="jp-revelar-nombre">{j.nombre}</span>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setRevelado([...revelado, i])}
                          >
                            Revelar
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="jp-acciones">
                <button type="button" className="btn btn-primary" onClick={nuevaRonda}>
                  Ronda nueva
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setJugando(false)}
                >
                  Cambiar ajustes
                </button>
              </div>
            </>
          )}

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'emojis' && !jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Dibujá los emojis</h2>
          <p className="jp-sub">
            {cantEmojis} emoji{cantEmojis === 1 ? '' : 's'}, tres segundos a la vista.
            Después se {cantEmojis === 1 ? 'dibuja' : 'dibujan'} de memoria.
          </p>
          <Previa
            sinCuenta
            tiempo={tiempoJuego}
            setTiempo={setTiempoJuego}
            ajustes={
              <>
                <div className="jp-etiqueta">Cuántos a la vez</div>
                <div className="jp-reloj">
                  <div className="jp-reloj-fila">
                    <button
                      type="button"
                      className="jp-mini"
                      aria-label="Menos emojis"
                      disabled={cantEmojis <= 1}
                      onClick={() => setCantEmojis((n) => Math.max(1, n - 1))}
                    >
                      −
                    </button>
                    <span className="jp-digitos jp-digitos-chico">{cantEmojis}</span>
                    <button
                      type="button"
                      className="jp-mini"
                      aria-label="Más emojis"
                      disabled={cantEmojis >= 10}
                      onClick={() => setCantEmojis((n) => Math.min(10, n + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            }
            onEmpezar={() => {
              setJugando(true)
              rondaEmojis()
            }}
          />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'emojis' && jugando && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Dibujá los emojis</h2>
          <p className="jp-sub">
            {faseE === 'espera' &&
              `${cantEmojis} emoji${cantEmojis === 1 ? '' : 's'}, tres segundos. Después ${
                cantEmojis === 1 ? 'lo dibujan' : 'los dibujan'
              } de memoria.`}
            {faseE === 'cuenta' && 'Ojos en la pantalla…'}
            {faseE === 'mostrando' && '¡Miralos bien!'}
            {faseE === 'dibujando' &&
              (cantEmojis === 1 ? 'Se fue. A dibujarlo de memoria.' : 'Se fueron. A dibujarlos todos, en orden.')}
          </p>

          {(faseE === 'espera' || faseE === 'dibujando') && (
            <div className="jp-reloj">
              <div className="jp-reloj-fila">
                <span className="jp-etiqueta jp-etiqueta-inline">Cuántos a la vez</span>
                <button
                  type="button"
                  className="jp-mini"
                  aria-label="Menos emojis"
                  disabled={cantEmojis <= 1}
                  onClick={() => setCantEmojis((n) => Math.max(1, n - 1))}
                >
                  −
                </button>
                <span className="jp-digitos jp-digitos-chico">{cantEmojis}</span>
                <button
                  type="button"
                  className="jp-mini"
                  aria-label="Más emojis"
                  disabled={cantEmojis >= 10}
                  onClick={() => setCantEmojis((n) => Math.min(10, n + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="jp-lienzo jp-emojis">
            {faseE === 'espera' && <span className="jp-emoji-espera">👀</span>}
            {faseE === 'cuenta' && <span className="jp-cuenta">{cuentaE}</span>}
            {(faseE === 'mostrando' || repaso) && (
              <div className="jp-emoji-fila">
                {emojis.map((e, i) => (
                  <span key={i}>{e}</span>
                ))}
              </div>
            )}
            {faseE === 'dibujando' && !repaso && <span className="jp-emoji-espera">✏️</span>}
            {faseE === 'mostrando' && <div className="jp-barra jp-barra-expo" />}
          </div>

          <div className="jp-acciones">
            {faseE === 'dibujando' ? (
              <>
                <button type="button" className="btn btn-primary" onClick={rondaEmojis}>
                  Otra ronda
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRepaso((r) => !r)}
                >
                  {repaso ? 'Ocultar' : 'Ver cuáles eran'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={faseE !== 'espera'}
                onClick={rondaEmojis}
              >
                {faseE === 'espera' ? 'Mostrar emojis' : 'Atenti…'}
              </button>
            )}
          </div>

          <Cronometro key={tiempoJuego} total={tiempoJuego} disparo={dispE} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}
    </>
  )
}
