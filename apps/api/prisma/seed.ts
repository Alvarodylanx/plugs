import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NOTES_DATA = [
  {
    title: 'Introduction to ICT',
    subject: 'Computer Science / ICT',
    tags: ['hardware', 'software', 'data'],
    summary: 'A comprehensive introduction to Information and Communication Technology covering fundamental concepts of hardware, software, and data processing.',
    aiTip: 'Focus on understanding the difference between hardware and software — this distinction appears in almost every ICT exam question.',
    readTime: '8 min',
    level: 'O-Level',
    sections: [
      {
        heading: 'What is ICT?',
        content: 'Information and Communication Technology (ICT) refers to all technologies used to handle telecommunications, broadcast media, intelligent building management systems, audiovisual processing and transmission systems, and network-based control and monitoring functions. ICT encompasses all digital technology that assists individuals, businesses and organisations in handling information. ICT covers any product that will store, retrieve, manipulate, transmit or receive information electronically in a digital form.',
        keyPoints: ['ICT stands for Information and Communication Technology', 'It includes both hardware and software', 'ICT systems process, store and communicate data', 'Examples: computers, smartphones, internet, television']
      },
      {
        heading: 'Hardware Components',
        content: 'Computer hardware refers to the physical components that make up a computer system. The main categories of hardware are: Input devices (keyboard, mouse, scanner, webcam), Output devices (monitor, printer, speakers), Storage devices (hard disk, USB drive, CD/DVD), and the Central Processing Unit (CPU). The CPU is the brain of the computer and consists of the Arithmetic Logic Unit (ALU), Control Unit (CU), and registers. RAM (Random Access Memory) is temporary storage used while the computer is running.',
        keyPoints: ['Hardware = physical components', 'Input devices send data into the computer', 'Output devices present processed information', 'CPU = ALU + Control Unit + Registers', 'RAM is temporary; ROM is permanent']
      },
      {
        heading: 'Software Types',
        content: 'Software is a set of instructions that tells the hardware what to do. System software manages the computer hardware and provides a platform for application software. The most important system software is the Operating System (OS), which manages resources and provides a user interface. Application software is designed to help users perform specific tasks — word processors, spreadsheets, games, and browsers are all examples. Utility software performs maintenance tasks such as antivirus scanning, disk cleanup, and file compression.',
        keyPoints: ['System software: OS, drivers, utilities', 'Application software: word processors, browsers, games', 'Operating System manages hardware resources', 'Firmware is software permanently stored in ROM', 'Open-source vs proprietary software']
      },
      {
        heading: 'Data Representation',
        content: 'Computers use binary (base-2) number system to represent all data. Binary uses only two digits: 0 and 1, called bits. A group of 8 bits is called a byte. Data sizes go from bits → bytes → kilobytes (KB) → megabytes (MB) → gigabytes (GB) → terabytes (TB). Text is stored using character encoding systems like ASCII (128 characters) or Unicode (over 1 million characters). Images are stored as pixels with colour values, and sound is stored by sampling the audio signal at regular intervals.',
        keyPoints: ['Binary = base-2 (uses 0 and 1)', '1 byte = 8 bits', 'ASCII encodes 128 characters', 'Pixels make up digital images', 'Sampling rate determines audio quality']
      }
    ],
    quiz: [
      { question: 'What does ICT stand for?', options: ['Information and Computer Technology', 'Information and Communication Technology', 'Integrated Circuit Technology', 'Internet and Computer Technology'], correct: 1, explanation: 'ICT stands for Information and Communication Technology — it covers all digital technologies for handling information.' },
      { question: 'Which component is considered the "brain" of a computer?', options: ['RAM', 'Hard Drive', 'CPU', 'GPU'], correct: 2, explanation: 'The CPU (Central Processing Unit) is the brain of the computer, responsible for executing instructions.' },
      { question: 'What is RAM used for?', options: ['Permanent storage', 'Temporary storage while running', 'Processing graphics', 'Connecting to the internet'], correct: 1, explanation: 'RAM is Random Access Memory — it stores data temporarily while programs are running.' },
      { question: 'How many bits are in a byte?', options: ['4', '16', '2', '8'], correct: 3, explanation: 'A byte consists of 8 bits. This is a fundamental unit in computing.' },
      { question: 'Which is an example of system software?', options: ['Microsoft Word', 'Google Chrome', 'Windows 11', 'Minecraft'], correct: 2, explanation: 'Windows 11 is an Operating System, which is system software. Word and Chrome are application software.' },
      { question: 'ASCII can encode how many characters?', options: ['256', '128', '64', '512'], correct: 1, explanation: 'ASCII encodes 128 characters using 7 bits (though stored in 8).' },
      { question: 'What type of device is a scanner?', options: ['Output device', 'Storage device', 'Processing device', 'Input device'], correct: 3, explanation: 'A scanner is an input device — it captures physical documents and sends them into the computer.' },
      { question: 'Which storage is temporary and loses data when power is off?', options: ['Hard disk', 'USB Drive', 'RAM', 'ROM'], correct: 2, explanation: 'RAM is volatile memory — it loses all data when the computer is powered off.' },
      { question: 'What does the ALU in a CPU stand for?', options: ['Analogue Logic Unit', 'Arithmetic Logic Unit', 'Automated Load Utility', 'Array Logic Unit'], correct: 1, explanation: 'ALU stands for Arithmetic Logic Unit — it performs mathematical and logical operations.' },
      { question: 'Unicode was created to improve upon ASCII because:', options: ['ASCII was too slow', 'ASCII only covered 128 characters', 'ASCII required too much storage', 'ASCII did not support numbers'], correct: 1, explanation: 'ASCII only covers 128 characters (English alphabet + symbols). Unicode supports over 1 million characters from all world languages.' },
      { question: 'What is a pixel?', options: ['A unit of data storage', 'The smallest unit of a digital image', 'A type of processor', 'A networking protocol'], correct: 1, explanation: 'A pixel (picture element) is the smallest unit of a digital image, displaying a single colour.' },
      { question: 'Which software performs maintenance tasks like antivirus scanning?', options: ['Application software', 'Utility software', 'Firmware', 'Middleware'], correct: 1, explanation: 'Utility software performs system maintenance tasks including antivirus scanning, disk cleanup, and data backup.' }
    ]
  },
  {
    title: 'Computer Networks & the Internet',
    subject: 'Computer Science / ICT',
    tags: ['networking', 'internet', 'protocols', 'TCP/IP'],
    summary: 'Explore how computers communicate over networks and the internet, covering protocols, topologies, and security.',
    aiTip: 'The OSI model layers are a common exam topic — use the mnemonic "Please Do Not Throw Sausage Pizza Away" (Physical, Data Link, Network, Transport, Session, Presentation, Application).',
    readTime: '10 min',
    level: 'O-Level',
    sections: [
      {
        heading: 'Types of Networks',
        content: 'A computer network is a group of computers and devices connected together to share resources and communicate. Networks are classified by geographic scale: LAN (Local Area Network) covers a small area like a school or office building; WAN (Wide Area Network) spans large geographic areas and can be nationwide or worldwide — the internet is the largest WAN. MAN (Metropolitan Area Network) covers a city. PAN (Personal Area Network) covers a very small area like Bluetooth connections between devices.',
        keyPoints: ['LAN: Local Area Network (building/campus)', 'WAN: Wide Area Network (nationwide/worldwide)', 'The Internet is the largest WAN', 'MAN: Metropolitan Area Network (city)', 'PAN: Personal Area Network (Bluetooth)']
      },
      {
        heading: 'Network Topologies',
        content: 'Network topology describes the physical or logical arrangement of devices in a network. Star topology: all devices connect to a central hub/switch — most common in modern LANs. Bus topology: all devices share a single cable — simple but failure of the main cable breaks the whole network. Ring topology: devices connect in a closed loop. Mesh topology: each device connects to every other device — very reliable but expensive. The choice of topology affects performance, reliability, and cost.',
        keyPoints: ['Star: all connect to central switch (most common)', 'Bus: single shared cable', 'Ring: circular connection', 'Mesh: every device connected to every other', 'Topology affects reliability and cost']
      },
      {
        heading: 'Protocols and the OSI Model',
        content: 'Network protocols are sets of rules that govern how data is transmitted. The OSI (Open Systems Interconnection) model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. TCP/IP (Transmission Control Protocol / Internet Protocol) is the foundation of the internet. TCP ensures reliable delivery by breaking data into packets and reassembling them. IP handles addressing and routing. HTTP/HTTPS are application-layer protocols for web browsing. FTP is used for file transfers. SMTP, POP3, IMAP are email protocols.',
        keyPoints: ['OSI has 7 layers: Physical to Application', 'TCP/IP is the internet backbone', 'TCP = reliable delivery via packets', 'IP = addressing and routing', 'HTTP/HTTPS for web, FTP for files, SMTP for email']
      },
      {
        heading: 'Network Security',
        content: 'Network security protects data during transmission and prevents unauthorised access. Common threats include: Malware (viruses, worms, Trojans, ransomware), Phishing (fraudulent emails tricking users into revealing data), Man-in-the-middle attacks (intercepting communications), DDoS attacks (overloading servers). Security measures: Firewalls filter incoming/outgoing traffic; Encryption scrambles data (TLS/SSL for HTTPS); Strong passwords and two-factor authentication; Regular software updates; VPN (Virtual Private Network) creates encrypted tunnels.',
        keyPoints: ['Threats: malware, phishing, DDoS, MITM', 'Firewall filters network traffic', 'Encryption protects data in transit (HTTPS/TLS)', 'VPN creates secure tunnels', '2FA adds an extra authentication layer']
      }
    ],
    quiz: [
      { question: 'What does LAN stand for?', options: ['Large Area Network', 'Local Area Network', 'Linked Area Network', 'Layered Area Network'], correct: 1, explanation: 'LAN stands for Local Area Network — a network covering a small geographic area like a building or campus.' },
      { question: 'How many layers does the OSI model have?', options: ['4', '5', '6', '7'], correct: 3, explanation: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      { question: 'Which topology connects all devices to a central switch?', options: ['Bus', 'Ring', 'Mesh', 'Star'], correct: 3, explanation: 'Star topology connects all devices to a central hub or switch. It is the most common topology in modern LANs.' },
      { question: 'What does TCP stand for?', options: ['Transfer Control Program', 'Transmission Control Protocol', 'Total Communication Package', 'Tunnelled Connection Point'], correct: 1, explanation: 'TCP stands for Transmission Control Protocol — it ensures reliable delivery of data by using packets and acknowledgements.' },
      { question: 'Which protocol is used for secure web browsing?', options: ['FTP', 'SMTP', 'HTTP', 'HTTPS'], correct: 3, explanation: 'HTTPS (Hypertext Transfer Protocol Secure) uses TLS/SSL encryption for secure web browsing.' },
      { question: 'What is a DDoS attack?', options: ['A virus that deletes files', 'Overloading a server with traffic', 'Stealing login credentials', 'Intercepting network communications'], correct: 1, explanation: 'DDoS (Distributed Denial of Service) attacks flood a server with enormous amounts of traffic, making it unavailable to legitimate users.' },
      { question: 'What does a firewall do?', options: ['Encrypts data', 'Filters network traffic', 'Compresses files', 'Allocates IP addresses'], correct: 1, explanation: 'A firewall monitors and filters incoming and outgoing network traffic based on security rules.' },
      { question: 'The Internet is best described as a:', options: ['LAN', 'MAN', 'WAN', 'PAN'], correct: 2, explanation: 'The Internet is the world\'s largest Wide Area Network (WAN), connecting billions of devices globally.' },
      { question: 'Which attack involves tricking users into revealing personal information via fake emails?', options: ['Phishing', 'Malware', 'DDoS', 'Brute force'], correct: 0, explanation: 'Phishing uses fraudulent emails or websites that appear legitimate to trick users into providing sensitive data.' },
      { question: 'What does VPN stand for?', options: ['Virtual Private Node', 'Very Protected Network', 'Virtual Private Network', 'Verified Packet Network'], correct: 2, explanation: 'VPN stands for Virtual Private Network — it creates an encrypted tunnel for secure communications over public networks.' },
      { question: 'Which protocol is used for sending email?', options: ['POP3', 'SMTP', 'HTTP', 'FTP'], correct: 1, explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails. POP3 and IMAP are used for receiving them.' },
      { question: 'In a Bus topology, what happens if the main cable fails?', options: ['Only the connected device fails', 'The entire network fails', 'Nothing, traffic reroutes', 'Only upload fails'], correct: 1, explanation: 'In bus topology, all devices share a single cable. If the main cable fails, the entire network goes down.' }
    ]
  },
  {
    title: 'Photosynthesis',
    subject: 'Biology',
    tags: ['plants', 'chloroplast', 'glucose', 'light'],
    summary: 'Understand how plants convert light energy into chemical energy through photosynthesis, covering the light-dependent and light-independent reactions.',
    aiTip: 'Always remember the overall equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Examiners often ask you to recall this and explain what each substance represents.',
    readTime: '7 min',
    level: 'O-Level',
    sections: [
      {
        heading: 'What is Photosynthesis?',
        content: 'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (from the sun) into chemical energy stored as glucose. It occurs in the chloroplasts of plant cells, specifically using the green pigment chlorophyll. The overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This means carbon dioxide and water are converted into glucose and oxygen using light. Oxygen is released as a by-product — this is the source of nearly all atmospheric oxygen on Earth.',
        keyPoints: ['Photosynthesis converts light energy to chemical energy', 'Occurs in chloroplasts using chlorophyll', 'Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', 'Produces glucose (food) and oxygen', 'Only organisms with chlorophyll can photosynthesize']
      },
      {
        heading: 'Factors Affecting Photosynthesis',
        content: 'The rate of photosynthesis is affected by several limiting factors. Light intensity: more light = faster photosynthesis (up to a maximum). Carbon dioxide concentration: higher CO₂ = faster rate (up to a maximum). Temperature: rate increases with temperature up to an optimum (~35°C), then enzymes denature and rate drops sharply. Water availability: water is a raw material; drought slows photosynthesis. Chlorophyll content: more chlorophyll = more light absorbed. In commercial greenhouses, farmers increase CO₂ levels, provide optimal lighting, and maintain ideal temperatures to maximise crop yield.',
        keyPoints: ['Limiting factors: light, CO₂, temperature, water', 'Optimum temperature ~35°C for most plants', 'Above optimum: enzymes denature, rate drops', 'Greenhouses artificially increase these factors', 'All factors interact — the slowest determines the rate']
      },
      {
        heading: 'Leaf Structure and Adaptation',
        content: 'Leaves are adapted to maximise photosynthesis. They are broad and flat to maximise surface area for light absorption. The upper epidermis is transparent to allow light through. The palisade mesophyll layer just below contains densely packed cells with many chloroplasts, where most photosynthesis occurs. The spongy mesophyll has air spaces that allow CO₂ to diffuse to cells. Stomata (pores) in the lower epidermis open to allow CO₂ in and O₂ out — guard cells control stomatal opening. Veins (vascular bundles) supply water via xylem and carry glucose away via phloem.',
        keyPoints: ['Broad flat shape maximises light absorption', 'Palisade mesophyll: main photosynthesis site', 'Stomata allow gas exchange (CO₂ in, O₂ out)', 'Guard cells control stomatal opening/closing', 'Xylem: water in; Phloem: glucose out']
      }
    ],
    quiz: [
      { question: 'What is the overall equation for photosynthesis?', options: ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂', '6O₂ + C₆H₁₂O₆ → 6CO₂ + 6H₂O + energy', 'CO₂ + H₂O → glucose'], correct: 1, explanation: 'The correct equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Carbon dioxide and water are inputs; glucose and oxygen are outputs.' },
      { question: 'In which organelle does photosynthesis occur?', options: ['Mitochondria', 'Ribosome', 'Chloroplast', 'Nucleus'], correct: 2, explanation: 'Photosynthesis occurs in chloroplasts, which contain the green pigment chlorophyll.' },
      { question: 'What is the green pigment that absorbs light for photosynthesis?', options: ['Haemoglobin', 'Melanin', 'Carotene', 'Chlorophyll'], correct: 3, explanation: 'Chlorophyll is the green pigment in plants that absorbs light energy (mainly red and blue wavelengths) for photosynthesis.' },
      { question: 'Which layer of the leaf contains the most chloroplasts?', options: ['Upper epidermis', 'Palisade mesophyll', 'Spongy mesophyll', 'Lower epidermis'], correct: 1, explanation: 'The palisade mesophyll layer contains densely packed cells with many chloroplasts, making it the primary site of photosynthesis.' },
      { question: 'What happens to the rate of photosynthesis when temperature exceeds the optimum?', options: ['Rate increases further', 'Rate stays the same', 'Rate drops as enzymes denature', 'Rate drops then rises again'], correct: 2, explanation: 'Above the optimum temperature (~35°C), enzymes like RuBisCO denature and the rate of photosynthesis drops sharply.' },
      { question: 'What is a by-product of photosynthesis that is released into the atmosphere?', options: ['Carbon dioxide', 'Water vapour', 'Nitrogen', 'Oxygen'], correct: 3, explanation: 'Oxygen is a by-product of photosynthesis, released when water molecules are split during the light-dependent reactions.' },
      { question: 'Stomata primarily allow:', options: ['Water to enter the leaf', 'Light to reach chloroplasts', 'Gas exchange (CO₂ and O₂)', 'Glucose to exit the leaf'], correct: 2, explanation: 'Stomata are pores mainly in the lower epidermis that open to allow CO₂ in for photosynthesis and O₂ out as a by-product.' },
      { question: 'Which vascular tissue carries glucose away from the leaf?', options: ['Xylem', 'Phloem', 'Cambium', 'Epidermis'], correct: 1, explanation: 'Phloem transports glucose (and other organic molecules) from the leaf to other parts of the plant.' },
      { question: 'What controls the opening and closing of stomata?', options: ['Root hair cells', 'Guard cells', 'Palisade cells', 'Epidermal cells'], correct: 1, explanation: 'Guard cells surround each stoma and change shape based on water content to open or close the stomatal pore.' },
      { question: 'Increasing CO₂ concentration in a greenhouse is done to:', options: ['Cool the plants', 'Increase photosynthesis rate', 'Prevent disease', 'Reduce water use'], correct: 1, explanation: 'Higher CO₂ concentrations increase the rate of photosynthesis (up to a maximum), increasing glucose production and crop yield.' },
      { question: 'Light intensity affects photosynthesis because:', options: ['More light cools leaves', 'Light provides energy for the reactions', 'Light produces CO₂', 'Light kills harmful bacteria'], correct: 1, explanation: 'Light provides the energy needed to drive the light-dependent reactions of photosynthesis.' },
      { question: 'The raw materials of photosynthesis are:', options: ['Glucose and oxygen', 'Carbon dioxide and water', 'Glucose and carbon dioxide', 'Oxygen and water'], correct: 1, explanation: 'The raw materials (reactants) for photosynthesis are carbon dioxide (from the air) and water (from the soil).' }
    ]
  },
  {
    title: 'Causes of World War II',
    subject: 'History',
    tags: ['WWII', 'Hitler', 'Treaty of Versailles', 'appeasement'],
    summary: 'An analysis of the long-term and short-term causes of World War II, from the Treaty of Versailles to Hitler\'s invasion of Poland.',
    aiTip: 'Examiners reward analysis over description. Always explain HOW each cause contributed to war, not just WHAT happened. Link causes together to show interconnection.',
    readTime: '9 min',
    level: 'A-Level',
    sections: [
      {
        heading: 'The Legacy of World War I and the Treaty of Versailles',
        content: 'The Treaty of Versailles (1919) imposed harsh punishments on Germany after WWI. The "War Guilt Clause" (Article 231) forced Germany to accept full responsibility for the war. Germany lost 13% of its territory, including the Rhineland, Alsace-Lorraine, and the Polish Corridor. The German military was severely restricted: army limited to 100,000 men, no air force, naval restrictions. Reparations of £6.6 billion were imposed. The humiliation created deep resentment among the German population, which politicians like Hitler exploited. The economist John Maynard Keynes warned that these terms would destabilise Europe — events proved him right.',
        keyPoints: ['Treaty of Versailles (1919) humiliated Germany', 'Article 231: War Guilt Clause', 'Germany lost 13% territory and all colonies', 'Military severely restricted', 'Reparations: £6.6 billion', 'Created resentment exploited by extremists']
      },
      {
        heading: 'The Rise of Hitler and Nazi Germany',
        content: 'Adolf Hitler exploited Germany\'s economic and political instability to rise to power. The Great Depression (1929) caused mass unemployment in Germany — 6 million by 1932. Hitler promised to restore German greatness, overturn the Treaty of Versailles, and create a racially pure Greater Germany. After becoming Chancellor in January 1933, Hitler rapidly consolidated power: the Reichstag Fire (1933) allowed emergency decrees; the Enabling Act (1933) gave Hitler dictatorial powers. Germany began rearmament in secret, then openly from 1935, violating the Treaty of Versailles. The Luftwaffe was re-established, conscription reintroduced, and the army rapidly expanded.',
        keyPoints: ['Great Depression created economic desperation', 'Hitler promised to reverse Versailles', 'Chancellor January 1933; Führer August 1934', 'Enabling Act gave dictatorial powers', 'Secret then open rearmament from 1933/1935', 'Popular support based on nationalism and economic recovery']
      },
      {
        heading: 'Appeasement and its Consequences',
        content: 'Appeasement was the policy of making concessions to aggressive powers to avoid war. Britain and France pursued it throughout the 1930s, hoping Hitler\'s demands were limited. Key events: 1936 — Hitler remilitarised the Rhineland; Britain and France did not react. 1938 — Anschluss (union with Austria); again no effective response. September 1938 — Munich Agreement: Chamberlain gave Hitler the Sudetenland in Czechoslovakia, declaring "peace for our time." This emboldened Hitler, who then occupied the rest of Czechoslovakia in March 1939. Appeasement failed because it was based on a misunderstanding of Hitler\'s ambitions — he did not want limited territorial gains but European domination.',
        keyPoints: ['Appeasement: giving concessions to avoid war', 'Britain/France hoped to satisfy Hitler\'s "limited" demands', 'Munich Agreement (1938): Sudetenland given to Hitler', '"Peace for our time" — Chamberlain', 'Appeasement emboldened Hitler rather than deterring him', 'Failed because Hitler\'s goals were unlimited']
      },
      {
        heading: 'The Invasion of Poland and Outbreak of War',
        content: 'After occupying Czechoslovakia in March 1939, Hitler turned to Poland. The Nazi-Soviet Pact (August 1939) between Hitler and Stalin shocked the world — the two ideological enemies agreed not to attack each other and secretly divided Eastern Europe between them. This removed Hitler\'s fear of a two-front war. On 1 September 1939, Germany invaded Poland using Blitzkrieg (lightning war) tactics. Britain and France, who had guaranteed Polish independence in March 1939, issued an ultimatum. When Germany did not withdraw, Britain declared war on 3 September 1939; France followed hours later. WWII had begun.',
        keyPoints: ['Nazi-Soviet Pact (August 1939) shocked the world', 'Removed Hitler\'s fear of two-front war', 'Germany invaded Poland: 1 September 1939', 'Britain/France had guaranteed Polish independence (March 1939)', 'Britain declared war: 3 September 1939', 'Blitzkrieg tactics overwhelmed Poland rapidly']
      }
    ],
    quiz: [
      { question: 'What did the "War Guilt Clause" (Article 231) require Germany to do?', options: ['Pay reparations immediately', 'Accept full responsibility for WWI', 'Disarm completely', 'Give up the Rhineland'], correct: 1, explanation: 'Article 231, the War Guilt Clause, forced Germany to accept full moral and legal responsibility for causing WWI, which was deeply humiliating.' },
      { question: 'How much were Germany\'s reparations set at?', options: ['£1 billion', '£3.6 billion', '£6.6 billion', '£10 billion'], correct: 2, explanation: 'Germany was required to pay £6.6 billion in reparations under the Treaty of Versailles, finally paid off in 2010.' },
      { question: 'When did Hitler become Chancellor of Germany?', options: ['January 1930', 'January 1933', 'August 1934', 'March 1935'], correct: 1, explanation: 'Hitler became Chancellor of Germany on 30 January 1933, appointed by President Hindenburg.' },
      { question: 'What was the Munich Agreement (1938)?', options: ['Germany\'s alliance with Italy', 'Britain/France giving Sudetenland to Hitler', 'Germany\'s invasion of Austria', 'The Nazi-Soviet Pact'], correct: 1, explanation: 'The Munich Agreement (September 1938) saw Britain and France allow Hitler to take the Sudetenland region of Czechoslovakia in exchange for a promise of no further expansion.' },
      { question: 'Who said "peace for our time" after Munich?', options: ['Winston Churchill', 'Franklin Roosevelt', 'Neville Chamberlain', 'Édouard Daladier'], correct: 2, explanation: 'British Prime Minister Neville Chamberlain declared "peace for our time" upon returning from Munich, believing he had successfully prevented war.' },
      { question: 'What was the Nazi-Soviet Pact?', options: ['A trade agreement between Germany and USSR', 'A non-aggression pact that secretly divided Eastern Europe', 'Germany\'s promise not to attack Soviet cities', 'An alliance against Britain and France'], correct: 1, explanation: 'The Nazi-Soviet Pact (August 1939) was a non-aggression treaty that also secretly divided Eastern Europe between Germany and the USSR.' },
      { question: 'When did Germany invade Poland?', options: ['1 August 1939', '3 September 1939', '1 September 1939', '23 August 1939'], correct: 2, explanation: 'Germany invaded Poland on 1 September 1939, triggering WWII. Britain declared war two days later on 3 September.' },
      { question: 'What is Blitzkrieg?', options: ['A defensive military strategy', 'Slow siege warfare', 'Lightning war using rapid combined forces', 'Naval blockade tactics'], correct: 2, explanation: 'Blitzkrieg (German for "lightning war") was a military tactic combining fast-moving tanks, motorised infantry, and air support to overwhelm opponents quickly.' },
      { question: 'Which event removed Hitler\'s fear of a two-front war?', options: ['Appeasement policy', 'The Munich Agreement', 'The Nazi-Soviet Pact', 'German rearmament'], correct: 2, explanation: 'The Nazi-Soviet Pact (August 1939) meant the USSR would not attack Germany from the east while Germany fought in the west.' },
      { question: 'What was Anschluss?', options: ['The German rearmament programme', 'The union of Germany and Austria', 'The invasion of Czechoslovakia', 'The Nazi-Soviet agreement'], correct: 1, explanation: 'Anschluss (1938) was the annexation/union of Austria into Nazi Germany, explicitly forbidden by the Treaty of Versailles.' },
      { question: 'The Great Depression affected Hitler\'s rise because:', options: ['It increased German exports', 'It caused mass unemployment making people desperate', 'It strengthened the Weimar Republic', 'It reduced inflation in Germany'], correct: 1, explanation: 'The Great Depression caused 6 million unemployed in Germany by 1932, creating desperation that made people receptive to Hitler\'s promises of economic recovery and national greatness.' },
      { question: 'Why did appeasement ultimately fail?', options: ['Germany was too weak to be appeased', 'Hitler\'s demands were truly unlimited', 'France refused to cooperate with Britain', 'The USSR prevented it from working'], correct: 1, explanation: 'Appeasement was based on the mistaken belief that Hitler had limited, satisfiable goals. In reality, Hitler sought European domination, so no concession would permanently satisfy him.' }
    ]
  },
  {
    title: 'Quadratic Equations & Functions',
    subject: 'Mathematics',
    tags: ['algebra', 'quadratics', 'factoring', 'parabola'],
    summary: 'Master quadratic equations through factoring, completing the square, and the quadratic formula, with applications to real-world problems.',
    aiTip: 'Always check your answers by substituting them back into the original equation. For the quadratic formula, memorise it as a song to the tune of "Pop Goes the Weasel".',
    readTime: '8 min',
    level: 'O-Level',
    sections: [
      {
        heading: 'Introduction to Quadratic Equations',
        content: 'A quadratic equation is an equation of the form ax² + bx + c = 0, where a ≠ 0. The highest power of x is 2. Quadratic equations can have 0, 1, or 2 real solutions (called roots). The discriminant (b² - 4ac) tells us: if positive → 2 real roots; if zero → 1 repeated root; if negative → no real roots. The graph of a quadratic function y = ax² + bx + c is called a parabola. If a > 0, the parabola opens upward (∪ shape); if a < 0, it opens downward (∩ shape). The vertex is the turning point of the parabola.',
        keyPoints: ['Form: ax² + bx + c = 0, where a ≠ 0', 'Discriminant b² - 4ac tells number of roots', 'Graph is a parabola (∪ or ∩)', 'Vertex = turning point of parabola', '0, 1, or 2 real solutions possible']
      },
      {
        heading: 'Solving by Factoring',
        content: 'Factoring is the simplest method when the quadratic factors neatly. Steps: (1) Write in standard form ax² + bx + c = 0. (2) Find two numbers that multiply to give ac and add to give b. (3) Rewrite and factor. (4) Set each factor to zero and solve. Example: x² - 5x + 6 = 0. We need two numbers that multiply to 6 and add to -5: these are -2 and -3. So (x - 2)(x - 3) = 0, giving x = 2 or x = 3. Note: not all quadratics factor neatly — then use completing the square or the quadratic formula.',
        keyPoints: ['Find factors of ac that sum to b', 'Set each factor = 0 to find roots', 'Check: substitute roots back in', 'Only works when quadratic factors over integers', 'Example: x² - 5x + 6 = (x-2)(x-3) = 0']
      },
      {
        heading: 'The Quadratic Formula',
        content: 'The quadratic formula solves any quadratic equation: x = (-b ± √(b² - 4ac)) / 2a. This always works, regardless of whether the equation factors neatly. Steps: (1) Identify a, b, c. (2) Calculate the discriminant b² - 4ac. (3) If discriminant ≥ 0, substitute into formula. (4) Calculate both solutions (+ and -). Example: 2x² + 5x - 3 = 0. Here a=2, b=5, c=-3. Discriminant = 25 - 4(2)(-3) = 25 + 24 = 49. x = (-5 ± 7) / 4. So x = 2/4 = 0.5 or x = -12/4 = -3.',
        keyPoints: ['x = (-b ± √(b² - 4ac)) / 2a', 'Works for ALL quadratic equations', 'Calculate discriminant first', 'Positive discriminant → 2 solutions', 'Example: 2x² + 5x - 3 = 0 → x = 0.5 or -3']
      }
    ],
    quiz: [
      { question: 'What is the standard form of a quadratic equation?', options: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx² + cx + d = 0', 'y = mx + c'], correct: 1, explanation: 'The standard form is ax² + bx + c = 0, where a ≠ 0 (if a were 0, it would be linear).' },
      { question: 'The discriminant b² - 4ac = 0 means:', options: ['No real roots', 'Two distinct real roots', 'One repeated root', 'Infinite roots'], correct: 2, explanation: 'When the discriminant equals zero, the quadratic has exactly one root (a repeated root), meaning the parabola touches but does not cross the x-axis.' },
      { question: 'What is the quadratic formula?', options: ['x = -b/2a', 'x = (-b ± √(b²-4ac)) / 2a', 'x = (b ± √(b²+4ac)) / 2a', 'x = (-b ± √(b²-4ac)) / a'], correct: 1, explanation: 'The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. Note the 2a in the denominator (not just a).' },
      { question: 'Solve x² - 5x + 6 = 0 by factoring:', options: ['x = 1 or x = 6', 'x = 2 or x = 3', 'x = -2 or x = -3', 'x = 5 or x = -6'], correct: 1, explanation: 'x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3. Check: (2)²-5(2)+6 = 4-10+6 = 0 ✓' },
      { question: 'If a > 0 in y = ax² + bx + c, the parabola opens:', options: ['Downward', 'Sideways', 'Upward', 'In a circle'], correct: 2, explanation: 'When a > 0, the parabola opens upward (∪ shape). When a < 0, it opens downward (∩ shape).' },
      { question: 'A quadratic with discriminant < 0 has:', options: ['Two real roots', 'One repeated root', 'No real roots', 'Three roots'], correct: 2, explanation: 'A negative discriminant means √(b²-4ac) would be the square root of a negative number, which has no real value — so no real roots.' },
      { question: 'What is the vertex of a parabola?', options: ['The y-intercept', 'The x-intercept', 'The turning point', 'The axis of symmetry'], correct: 2, explanation: 'The vertex is the turning point of the parabola — either the minimum point (a>0) or maximum point (a<0).' },
      { question: 'For 2x² + 5x - 3 = 0, what is the value of a, b, c?', options: ['a=2, b=5, c=3', 'a=2, b=5, c=-3', 'a=1, b=5, c=-3', 'a=2, b=-5, c=-3'], correct: 1, explanation: 'Comparing with ax² + bx + c = 0: a=2, b=5, c=-3. The sign of c is negative because the original equation has -3.' },
      { question: 'The discriminant of x² + 4x + 4 = 0 is:', options: ['32', '0', '16', '-16'], correct: 1, explanation: 'Discriminant = b² - 4ac = (4)² - 4(1)(4) = 16 - 16 = 0. So this quadratic has exactly one repeated root.' },
      { question: 'Complete the square: x² + 6x = (x + ?)² - ?', options: ['(x+3)² - 9', '(x+6)² - 36', '(x+3)² - 6', '(x+6)² - 6'], correct: 0, explanation: 'For x² + 6x, half of 6 is 3, so (x+3)² = x² + 6x + 9. Therefore x² + 6x = (x+3)² - 9.' },
      { question: 'How many real solutions does x² + 1 = 0 have?', options: ['1', '2', '0', 'Infinite'], correct: 2, explanation: 'Discriminant = 0 - 4(1)(1) = -4 < 0. No real solutions exist (complex roots exist: x = ±i).' },
      { question: 'Solve 3x² - 12 = 0:', options: ['x = ±4', 'x = ±2', 'x = 4', 'x = ±√12'], correct: 1, explanation: '3x² = 12 → x² = 4 → x = ±2. Check: 3(4) - 12 = 0 ✓' }
    ]
  }
];

const THREADS_DATA = [
  {
    title: 'Can someone explain the difference between mitosis and meiosis?',
    content: 'I keep getting confused between these two types of cell division. Could someone break down the key differences? I know mitosis produces 2 identical cells and meiosis produces 4 cells, but I\'m confused about when each happens and why.',
    subject: 'Biology',
    tags: ['cell division', 'genetics', 'A-Level'],
    pinned: true,
    solved: true,
    views: 342,
    replies: [
      {
        content: 'Great question! Here\'s a clear breakdown:\n\n**Mitosis:**\n- Produces 2 genetically IDENTICAL daughter cells\n- Diploid (2n) → Diploid (2n)\n- Used for: growth, repair, asexual reproduction\n- 1 division\n- No crossing over\n\n**Meiosis:**\n- Produces 4 genetically DIFFERENT cells (gametes)\n- Diploid (2n) → Haploid (n)\n- Used for: sexual reproduction (sperm, eggs)\n- 2 divisions (meiosis I and meiosis II)\n- Crossing over in Prophase I creates genetic variation\n\nMemory tip: "MitOsis = One division, identical cells. MeiOsis = twO divisions, different cells."',
        author: 'Amara K.'
      },
      {
        content: 'Adding to the above — a common exam question asks about crossing over. This happens during Prophase I of meiosis when homologous chromosomes swap sections, creating new allele combinations. This is a major source of genetic variation in sexually reproducing organisms.',
        author: 'Priya S.'
      }
    ]
  },
  {
    title: 'Best trick for remembering the OSI model layers?',
    content: 'Our teacher keeps saying the OSI model will be on the paper and I\'m terrible at remembering all 7 layers in order. Anyone have a good mnemonic?',
    subject: 'Computer Science / ICT',
    tags: ['networking', 'OSI model', 'O-Level'],
    pinned: false,
    solved: true,
    views: 289,
    replies: [
      {
        content: 'The classic mnemonic is: **"Please Do Not Throw Sausage Pizza Away"**\n\n- **P**hysical\n- **D**ata Link\n- **N**etwork\n- **T**ransport\n- **S**ession\n- **P**resentation\n- **A**pplication\n\nThis goes from bottom (layer 1) to top (layer 7). Examiners often ask from the top down, so also memorize: "All People Seem To Need Data Processing."',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'Tips for A-Level History essay writing — how do I structure analysis?',
    content: 'I\'m struggling with my History essays. My teacher says I\'m just describing events and not analysing. How do I shift to analysis? Especially for causation questions like "Why did WWII start?"',
    subject: 'History',
    tags: ['essay writing', 'analysis', 'causation', 'A-Level'],
    pinned: false,
    solved: false,
    views: 156,
    replies: [
      {
        content: 'The key shift from description to analysis is asking "SO WHAT?" after every point. Don\'t just say "The Treaty of Versailles humiliated Germany." Ask: So what? → "This humiliation created resentment that destabilised the Weimar Republic and made Germans receptive to extremist promises of national revival, directly contributing to Hitler\'s electoral success."\n\nFor structure, use **PEEL**: Point → Evidence → Explanation → Link back to the question.',
        author: 'Amara K.'
      },
      {
        content: 'Also — for causation essays, historians love to debate long-term vs short-term causes, and underlying vs trigger causes. Show you understand this hierarchy. E.g., for WWII: long-term = Versailles; short-term = Nazi-Soviet Pact; trigger = invasion of Poland. Examiners reward this kind of historical thinking.',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'How does DNA replication work step by step?',
    content: 'We covered DNA replication in class but I\'m still confused about the role of enzymes. Can someone explain the full process clearly, especially helicase and DNA polymerase?',
    subject: 'Biology',
    tags: ['DNA', 'genetics', 'enzymes', 'A-Level'],
    pinned: false,
    solved: false,
    views: 198,
    replies: [
      {
        content: 'DNA replication is semi-conservative. Here\'s the step-by-step:\n\n1. **Unwinding**: Helicase enzyme unzips the double helix by breaking hydrogen bonds between base pairs\n2. **Primer laying**: Primase adds a short RNA primer to give DNA polymerase a starting point\n3. **Elongation**: DNA Polymerase III adds complementary nucleotides (A-T, G-C) in the 5\'→3\' direction\n4. **Leading/Lagging strand**: One strand is synthesised continuously (leading), the other in fragments (Okazaki fragments on lagging strand)\n5. **Sealing**: DNA Ligase joins the Okazaki fragments\n6. **Result**: 2 identical double-stranded DNA molecules, each with one original and one new strand (semi-conservative)',
        author: 'Priya S.'
      }
    ]
  },
  {
    title: 'Quick methods for solving simultaneous equations — any shortcuts?',
    content: 'I can solve simultaneous equations but I\'m really slow at it in exams. Are there faster methods I should use? We\'ve been taught elimination and substitution but which is faster?',
    subject: 'Mathematics',
    tags: ['algebra', 'simultaneous equations', 'exam technique'],
    pinned: false,
    solved: true,
    views: 223,
    replies: [
      {
        content: '**Elimination is usually faster** when the equations already have matching coefficients or you can easily multiply to match them.\n\n**Substitution is better** when one equation already has a variable isolated (e.g., y = 2x + 3).\n\n**Quick tips:**\n- For linear simultaneous equations: elimination is almost always fastest\n- Write coefficients first and decide which to eliminate before writing anything else\n- After finding one variable, always substitute into the *simpler* equation\n- Check by substituting BOTH values into BOTH original equations\n\nWith practice, linear simultaneous equations should take under 2 minutes.',
        author: 'Kwame A.'
      }
    ]
  }
];

async function main() {
  console.log('🌱 Seeding Plug database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo1234!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'alex@auraprep.com' },
    update: {},
    create: {
      name: 'Alex Student',
      email: 'alex@auraprep.com',
      password: hashedPassword,
      level: 'O-Level',
      points: 1450,
      streak: 12,
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // Create leaderboard users
  const leaderboardUsers = [
    { name: 'Amara K.', email: 'amara@auraprep.com', points: 3240, streak: 24 },
    { name: 'David O.', email: 'david@auraprep.com', points: 2810, streak: 18 },
    { name: 'Priya S.', email: 'priya@auraprep.com', points: 2350, streak: 15 },
    { name: 'Kwame A.', email: 'kwame@auraprep.com', points: 1280, streak: 9 },
  ];

  const createdUsers = [demoUser];
  for (const userData of leaderboardUsers) {
    const hp = await bcrypt.hash('pass1234!', 10);
    const u = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, password: hp, level: 'A-Level' },
    });
    createdUsers.push(u);
  }
  console.log('✅ Leaderboard users created');

  // Seed built-in notes
  for (const noteData of NOTES_DATA) {
    await prisma.note.create({
      data: {
        ...noteData,
        sections: noteData.sections as any,
        quiz: noteData.quiz as any,
        isBuiltIn: true,
        userId: demoUser.id,
      },
    });
  }
  console.log('✅ Built-in notes seeded (5 notes)');

  // Seed community threads
  const usernameToId = Object.fromEntries(createdUsers.map(u => [u.name, u.id]));
  for (const threadData of THREADS_DATA) {
    const thread = await prisma.thread.create({
      data: {
        title: threadData.title,
        content: threadData.content,
        subject: threadData.subject,
        tags: threadData.tags,
        pinned: threadData.pinned,
        solved: threadData.solved,
        views: threadData.views,
        authorId: demoUser.id,
      },
    });
    for (const reply of threadData.replies) {
      const authorId = usernameToId[reply.author] || demoUser.id;
      await prisma.reply.create({
        data: {
          content: reply.content,
          authorId,
          threadId: thread.id,
        },
      });
    }
  }
  console.log('✅ Community threads seeded (5 threads)');

  // Seed timetable sessions
  const today = new Date();
  const days = ['2025-05-19', '2025-05-20', '2025-05-21', '2025-05-22', '2025-05-23'];
  const sessionData = [
    { subject: 'Mathematics', date: days[0], time: '09:00', endTime: '10:30', completed: true, notes: 'Quadratic equations revision' },
    { subject: 'Biology', date: days[0], time: '14:00', endTime: '15:00', completed: true, notes: 'Photosynthesis notes' },
    { subject: 'Computer Science / ICT', date: days[1], time: '10:00', endTime: '11:30', completed: true, notes: 'Networks chapter' },
    { subject: 'History', date: days[2], time: '09:00', endTime: '10:30', completed: false, notes: 'WWII causes essay plan' },
    { subject: 'Physics', date: days[2], time: '15:00', endTime: '16:00', completed: false, notes: 'Forces and motion' },
    { subject: 'English', date: days[3], time: '11:00', endTime: '12:00', completed: false, notes: 'Essay structure practice' },
    { subject: 'Chemistry', date: days[4], time: '09:00', endTime: '10:30', completed: false, notes: 'Organic chemistry intro' },
  ];
  for (const s of sessionData) {
    await prisma.session.create({ data: { ...s, userId: demoUser.id } });
  }
  console.log('✅ Timetable sessions seeded');

  // Seed study logs
  const studyLogData = [
    { subject: 'Mathematics', hours: 2.5, date: '2025-05-15' },
    { subject: 'Biology', hours: 1.5, date: '2025-05-16' },
    { subject: 'Computer Science / ICT', hours: 3, date: '2025-05-17' },
    { subject: 'History', hours: 2, date: '2025-05-18' },
    { subject: 'Mathematics', hours: 1.5, date: '2025-05-19' },
    { subject: 'Physics', hours: 2, date: '2025-05-20' },
    { subject: 'English', hours: 1, date: '2025-05-21' },
  ];
  for (const log of studyLogData) {
    await prisma.studyLog.create({ data: { ...log, userId: demoUser.id } });
  }
  console.log('✅ Study logs seeded');

  // Seed badges
  const badgeData = [
    { name: 'First Steps', description: 'Completed your first study session', emoji: '👣', userId: demoUser.id },
    { name: 'Quiz Master', description: 'Scored 100% on a quiz', emoji: '🎯', userId: demoUser.id },
    { name: 'Week Warrior', description: 'Maintained a 7-day streak', emoji: '🔥', userId: demoUser.id },
    { name: 'Note Ninja', description: 'Read 10 complete notes', emoji: '📚', userId: demoUser.id },
    { name: 'Community Star', description: 'Received 10 likes on a post', emoji: '⭐', userId: demoUser.id },
    { name: 'Science Ace', description: 'Completed all Biology quizzes', emoji: '🔬', userId: demoUser.id },
  ];
  for (const badge of badgeData) {
    await prisma.badge.create({ data: badge });
  }
  console.log('✅ Badges seeded');

  console.log('\n🎉 Seed complete! Login with: alex@auraprep.com / demo1234!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
