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
      { question: 'Which software performs maintenance tasks like antivirus scanning?', options: ['Application software', 'Utility software', 'Firmware', 'Middleware'], correct: 1, explanation: 'Utility software performs system maintenance tasks including antivirus scanning, disk cleanup, and data backup.' },
      { question: 'What does ROM stand for?', options: ['Random Output Memory', 'Read-Only Memory', 'Rapid Operation Module', 'Remote Object Memory'], correct: 1, explanation: 'ROM stands for Read-Only Memory — it stores permanent firmware (like BIOS) that is not lost when power is off.' },
      { question: 'Which of these is an example of secondary storage?', options: ['RAM', 'CPU cache', 'Hard disk drive', 'Registers'], correct: 2, explanation: 'Hard disk drives (HDD) and SSDs are secondary storage — they are non-volatile, meaning data is retained when power is off.' },
      { question: 'How many different values can 4 bits represent?', options: ['4', '8', '16', '32'], correct: 2, explanation: 'n bits can represent 2ⁿ values. 2⁴ = 16, so 4 bits can represent 16 different values (0 to 15).' },
      { question: 'What is the function of the Control Unit (CU) in a CPU?', options: ['Performs arithmetic calculations', 'Fetches and decodes instructions', 'Stores long-term data', 'Manages network connections'], correct: 1, explanation: 'The Control Unit fetches instructions from memory, decodes them, and controls the execution of operations by other CPU components.' },
      { question: 'Which is NOT an example of an input device?', options: ['Keyboard', 'Barcode scanner', 'Projector', 'Microphone'], correct: 2, explanation: 'A projector is an output device — it displays information to users. All others (keyboard, barcode scanner, microphone) take data into the computer.' },
      { question: 'What does BIOS stand for?', options: ['Binary Input/Output System', 'Basic Input/Output System', 'Buffered Integrated Operating System', 'Base Internal Output Storage'], correct: 1, explanation: 'BIOS (Basic Input/Output System) is firmware stored in ROM that initialises hardware when the computer starts and loads the operating system.' },
      { question: 'Converting the binary number 1010 to decimal gives:', options: ['8', '12', '10', '6'], correct: 2, explanation: '1010 in binary = 1×8 + 0×4 + 1×2 + 0×1 = 8 + 0 + 2 + 0 = 10 in decimal.' }
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
      { question: 'In a Bus topology, what happens if the main cable fails?', options: ['Only the connected device fails', 'The entire network fails', 'Nothing, traffic reroutes', 'Only upload fails'], correct: 1, explanation: 'In bus topology, all devices share a single cable. If the main cable fails, the entire network goes down.' },
      { question: 'What does DNS stand for?', options: ['Data Network Service', 'Domain Name System', 'Digital Network Security', 'Direct Node Server'], correct: 1, explanation: 'DNS (Domain Name System) translates human-readable domain names (e.g. google.com) into IP addresses that computers use to find each other.' },
      { question: 'An IP address is used to:', options: ['Identify the type of operating system', 'Uniquely identify a device on a network', 'Encrypt network traffic', 'Measure network speed'], correct: 1, explanation: 'An IP address (Internet Protocol address) uniquely identifies each device on a network, allowing data to be routed to the correct destination.' },
      { question: 'What is bandwidth?', options: ['The physical size of a network cable', 'The maximum data transfer rate of a connection', 'The number of devices on a network', 'The delay in data transmission'], correct: 1, explanation: 'Bandwidth is the maximum amount of data that can be transmitted over a network connection per second, typically measured in Mbps or Gbps.' },
      { question: 'What does NIC stand for?', options: ['Network Interface Card', 'Node Internet Controller', 'Network Internal Component', 'New IP Configuration'], correct: 0, explanation: 'NIC stands for Network Interface Card — the hardware component that connects a computer to a network.' },
      { question: 'Which OSI model layer handles logical IP addressing and routing?', options: ['Layer 1 – Physical', 'Layer 2 – Data Link', 'Layer 3 – Network', 'Layer 4 – Transport'], correct: 2, explanation: 'Layer 3 (Network layer) handles logical addressing (IP addresses) and routing of packets between different networks.' },
      { question: 'What is network latency?', options: ['The maximum speed of a network', 'The delay between sending and receiving data', 'The number of connected devices', 'The size of data packets'], correct: 1, explanation: 'Latency is the time delay between sending data and it arriving at its destination, usually measured in milliseconds (ms). Low latency is important for gaming and video calls.' },
      { question: 'HTTPS uses which default port number?', options: ['80', '21', '443', '25'], correct: 2, explanation: 'HTTPS (secure HTTP) uses port 443 by default. Regular HTTP uses port 80. Knowing common port numbers is useful for network security topics.' }
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
      { question: 'The raw materials of photosynthesis are:', options: ['Glucose and oxygen', 'Carbon dioxide and water', 'Glucose and carbon dioxide', 'Oxygen and water'], correct: 1, explanation: 'The raw materials (reactants) for photosynthesis are carbon dioxide (from the air) and water (from the soil).' },
      { question: 'Photosynthesis can be divided into which two main stages?', options: ['Aerobic and anaerobic reactions', 'Light-dependent and light-independent reactions', 'Oxidation and reduction reactions', 'Glycolysis and Krebs cycle'], correct: 1, explanation: 'Photosynthesis has two stages: the light-dependent reactions (in the thylakoid membranes) and the light-independent reactions / Calvin cycle (in the stroma of the chloroplast).' },
      { question: 'In the light-dependent reactions, water molecules are split to release:', options: ['Carbon dioxide and ATP', 'Glucose and NADPH', 'Oxygen and hydrogen (electrons)', 'ATP and carbon dioxide'], correct: 2, explanation: 'In the light-dependent reactions, photolysis splits water (H₂O) into oxygen (released as a by-product), protons, and electrons. The electrons replace those lost by chlorophyll.' },
      { question: 'The Calvin cycle (light-independent reactions) takes place in the:', options: ['Thylakoid membranes', 'Cell nucleus', 'Stroma of the chloroplast', 'Mitochondria'], correct: 2, explanation: 'The Calvin cycle occurs in the stroma (the fluid-filled space) of the chloroplast. It uses ATP and NADPH from the light-dependent reactions to fix CO₂ into glucose.' }
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
      { question: 'Why did appeasement ultimately fail?', options: ['Germany was too weak to be appeased', 'Hitler\'s demands were truly unlimited', 'France refused to cooperate with Britain', 'The USSR prevented it from working'], correct: 1, explanation: 'Appeasement was based on the mistaken belief that Hitler had limited, satisfiable goals. In reality, Hitler sought European domination, so no concession would permanently satisfy him.' },
      { question: 'The League of Nations was created after WWI primarily to:', options: ['Punish Germany financially', 'Prevent future wars through collective security', 'Divide Germany\'s colonies among the Allies', 'Establish a global trading system'], correct: 1, explanation: 'The League of Nations (1920) was designed to prevent future wars through collective security — members would act together against aggressors. Its failure to stop 1930s aggression contributed to WWII.' },
      { question: 'What was the Enabling Act (1933)?', options: ['The law that created the Nazi Party', 'Legislation giving Hitler dictatorial powers to rule by decree', 'The act that banned all other political parties', 'A law increasing the German army size'], correct: 1, explanation: 'The Enabling Act (March 1933) allowed Hitler to pass laws without the Reichstag\'s approval, effectively making him a dictator. It was passed after the Reichstag Fire created a climate of fear.' },
      { question: 'When did Germany formally begin open rearmament, violating the Treaty of Versailles?', options: ['1933', '1934', '1935', '1936'], correct: 2, explanation: 'Hitler reintroduced conscription and openly announced German rearmament in 1935. Secret rearmament had begun earlier, but 1935 was the open violation of the Treaty of Versailles.' },
      { question: 'Which term describes Germany\'s rapid military tactics that overwhelmed Poland in 1939?', options: ['Trench warfare', 'Blitzkrieg', 'Siege warfare', 'Guerrilla tactics'], correct: 1, explanation: 'Blitzkrieg ("lightning war") combined fast-moving tanks, motorised infantry, and close air support (Stuka dive bombers) to penetrate and encircle enemy forces before they could react.' },
      { question: 'What was Hitler\'s autobiography/political manifesto called?', options: ['Der Spiegel', 'Mein Kampf', 'Das Kapital', 'Thus Spoke Zarathustra'], correct: 1, explanation: 'Mein Kampf ("My Struggle"), written by Hitler during his imprisonment (1923-24), outlined his ideology: extreme nationalism, anti-Semitism, and the need for Lebensraum (living space) in Eastern Europe.' },
      { question: 'Which country was the first Hitler invaded in violation of Versailles (besides Germany itself)?', options: ['Austria', 'Poland', 'Czechoslovakia', 'The Rhineland'], correct: 3, explanation: 'The Rhineland (1936) was the first test — Germany remilitarised this demilitarised zone. Britain and France failed to respond, emboldening Hitler. Note: the Rhineland is German territory, but Versailles forbade military presence there.' }
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
      { question: 'Solve 3x² - 12 = 0:', options: ['x = ±4', 'x = ±2', 'x = 4', 'x = ±√12'], correct: 1, explanation: '3x² = 12 → x² = 4 → x = ±2. Check: 3(4) - 12 = 0 ✓' },
      { question: 'The x-coordinate of the vertex of y = ax² + bx + c is given by:', options: ['x = b/2a', 'x = -b/2a', 'x = -b/a', 'x = c/a'], correct: 1, explanation: 'The vertex x-coordinate is x = -b/2a. This is also the axis of symmetry of the parabola. Substitute back to find the y-coordinate.' },
      { question: 'If a quadratic has roots x = 3 and x = -2, which equation describes it?', options: ['x² - x - 6 = 0', 'x² + x - 6 = 0', 'x² - x + 6 = 0', 'x² + x + 6 = 0'], correct: 0, explanation: '(x - 3)(x + 2) = x² + 2x - 3x - 6 = x² - x - 6 = 0. Always expand and check with both roots.' },
      { question: 'For ax² + bx + c = 0, the product of the two roots equals:', options: ['b/a', '-b/a', 'c/a', '-c/a'], correct: 2, explanation: 'By Vieta\'s formulas: sum of roots = -b/a and product of roots = c/a. These allow you to check answers quickly without solving.' },
      { question: 'Completing the square for x² - 8x gives:', options: ['(x-4)² + 16', '(x-4)² - 16', '(x-8)² - 64', '(x-4)² - 8'], correct: 1, explanation: 'Half of -8 is -4. So (x-4)² = x² - 8x + 16. Therefore x² - 8x = (x-4)² - 16.' },
      { question: 'Which quadratic equation has NO real solutions?', options: ['x² - 4 = 0', 'x² + 4x + 4 = 0', 'x² + 4 = 0', 'x² + 4x - 4 = 0'], correct: 2, explanation: 'x² + 4 = 0 → x² = -4. Since no real number squared gives a negative result, this has no real solutions. Its discriminant is 0 - 4(1)(4) = -16 < 0.' }
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
      },
      {
        content: 'As an ICT teacher, I\'d add: the OSI model is **conceptual** — real networks use TCP/IP (4 layers). But it\'s essential for troubleshooting: Layer 1 (no cable?), Layer 3 (wrong IP/routing?), Layer 7 (HTTP 500 error?).\n\nAlso know **encapsulation**: each layer ADDS a header when sending, and **decapsulation** strips headers when receiving. Each layer only communicates with its counterpart on the remote device. For exam questions — if asked about the Network layer, say: attaches IP source/destination addresses, determines optimal route via routing tables. This layer-specific detail is what separates B from A grades.',
        author: 'Mr. Fon Henry Wir'
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
      },
      {
        content: 'As a GCE A-Level examiner, I can confirm PEEL is exactly what markers look for. But the biggest mark-loser is **narrative drift** — telling the story chronologically without explaining significance. Every paragraph should START with an analytical claim, not "In 1933, Hitler..."\n\nFor causation essays, use **HINGE language**:\n- "This was significant **because**..."\n- "**Consequently**, this meant that..."\n- "**Without this**, it would have been impossible to..."\n\nTop marks go to essays that **compare** causes: "While the Treaty of Versailles created long-term resentment, it was the Great Depression that made this actionable by collapsing the moderate parties Hitler needed to displace." One cause explains WHY something was possible; another explains WHY it happened when it did. Show you understand this hierarchy and you\'ll stand out.',
        author: 'Miss Tchamba Laure Nji'
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
      },
      {
        content: 'One speed technique many students overlook: **coefficient inspection** before multiplying. Check if coefficients are already equal or differ by a simple factor before doing any work.\n\nExample: 2x + 3y = 12 and 4x + 3y = 18 → subtract the first from the second directly: 2x = 6, so x = 3. Done in one step — no multiplication needed.\n\n**Exam timing guidance**: target under 90 seconds for linear simultaneous equations with integers. For 5-mark problems involving fractions or three unknowns, allow 3 minutes. GCE Papers are time-pressured — automatise the pattern, not just the method. Practice until the coefficient check is instinctive.',
        author: 'Dr. Ngo Paul Brice'
      }
    ]
  },

  // ─── Biology ──────────────────────────────────────────────────────────────
  {
    title: 'Aerobic vs anaerobic respiration — can someone explain the differences clearly?',
    content: 'I know aerobic respiration uses oxygen and anaerobic doesn\'t, but I keep mixing up the products and equations. Also when does your body actually switch to anaerobic? Is it only during exercise?',
    subject: 'Biology',
    tags: ['respiration', 'metabolism', 'O-Level'],
    pinned: false,
    solved: true,
    views: 311,
    replies: [
      {
        content: 'Great question — here\'s a clear side-by-side comparison:\n\n**Aerobic respiration:**\n- Equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + **38 ATP**\n- Occurs in: cytoplasm (glycolysis) and mitochondria (Krebs cycle + ETC)\n- Products: CO₂, water, lots of ATP\n- When: at rest or moderate exercise\n\n**Anaerobic respiration (in humans):**\n- Equation: C₆H₁₂O₆ → 2C₃H₆O₃ + **2 ATP** (lactic acid fermentation)\n- Occurs in: cytoplasm only\n- Products: lactic acid, small amount of ATP\n- When: during intense exercise when O₂ can\'t be delivered fast enough\n\nThe key difference: aerobic produces 19× more ATP! But aerobic needs oxygen, so when muscles demand energy faster than your cardiovascular system can supply O₂, you switch to anaerobic. Lactic acid build-up causes the "burn" you feel.',
        author: 'Priya S.'
      },
      {
        content: 'Worth adding: yeast uses a different form of anaerobic respiration called **alcoholic fermentation**:\nC₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2 ATP\n\nThis is the basis of brewing beer and wine, and how bread rises (the CO₂ bubbles make dough expand). This distinction comes up in exams — make sure you know lactic acid fermentation is for animals/muscles, and alcoholic fermentation is for yeast/plants.',
        author: 'David O.'
      },
      {
        content: 'One more exam tip: after intense exercise, you have an "oxygen debt" (EPOC — excess post-exercise oxygen consumption). You breathe heavily afterwards to supply extra O₂ to the liver, which converts accumulated lactic acid back to glucose. This explains why you keep panting even after you stop running.',
        author: 'Amara K.'
      }
    ]
  },
  {
    title: 'How do vaccines work? Explaining the immune response step by step',
    content: 'Our teacher rushed through immunology and I\'m lost on how vaccines actually protect you. Can someone break down what happens when you get vaccinated? Also what\'s the difference between active and passive immunity?',
    subject: 'Biology',
    tags: ['immunology', 'vaccines', 'immune response', 'A-Level'],
    pinned: false,
    solved: true,
    views: 274,
    replies: [
      {
        content: 'Here\'s the immune response step by step when you receive a vaccine:\n\n1. **Vaccination**: You receive weakened/killed pathogens, or just their antigens (surface proteins)\n2. **Phagocytosis**: Phagocytes engulf and destroy the antigens; macrophages present antigens on their surface (antigen-presenting cells)\n3. **T-Helper cell activation**: T-Helper cells (CD4+) recognise the antigen and release cytokines to amplify the immune response\n4. **B-cell activation**: B-cells specific to that antigen divide and differentiate into:\n   - **Plasma cells**: secrete antibodies specific to the antigen (primary response)\n   - **Memory B-cells**: long-lived cells that "remember" the antigen\n5. **Antibody action**: Antibodies neutralise the pathogen, agglutinate it, or mark it for phagocytosis (opsonisation)\n6. **Future protection**: If the real pathogen appears, memory B-cells trigger a rapid, massive secondary response before symptoms develop → you\'re immune!',
        author: 'Priya S.'
      },
      {
        content: '**Active vs Passive immunity:**\n\n**Active immunity**: Your OWN immune system makes antibodies\n- Natural active: getting the actual disease (e.g., chickenpox once → immune for life)\n- Artificial active: vaccination (introduces antigen without the disease)\n- Long-lasting (memory cells can last decades)\n\n**Passive immunity**: You receive READY-MADE antibodies from an external source\n- Natural passive: antibodies from mother to foetus via placenta, or in breast milk\n- Artificial passive: injected antibodies/antiserum (e.g., anti-venom, rabies treatment after bite)\n- Fast but SHORT-LIVED (no memory cells produced; antibodies break down in weeks/months)\n\nMemory trick: **Active = your body Acts** (makes its own antibodies). **Passive = you Passively receive** them.',
        author: 'Amara K.'
      }
    ]
  },
  {
    title: 'Enzyme inhibition — competitive vs non-competitive, I always mix them up',
    content: 'Can someone explain competitive and non-competitive enzyme inhibition with clear examples? I always mix up which one changes Vmax and which changes Km. This is on my A-Level paper next month.',
    subject: 'Biology',
    tags: ['enzymes', 'A-Level', 'biochemistry'],
    pinned: false,
    solved: false,
    views: 187,
    replies: [
      {
        content: 'Here\'s the clearest way to remember them:\n\n**Competitive inhibition:**\n- Inhibitor LOOKS LIKE the substrate → competes for the active site\n- Effect: INCREASES Km (apparent), Vmax UNCHANGED (add enough substrate, you can outcompete it)\n- Example: Statins competitively inhibit HMG-CoA reductase (cholesterol synthesis enzyme). Malonate inhibits succinate dehydrogenase in the Krebs cycle.\n- On a Lineweaver-Burk plot: lines intersect on the y-axis (same Vmax), x-intercept shifts\n\n**Non-competitive inhibition:**\n- Inhibitor binds ELSEWHERE (allosteric site), changes enzyme shape\n- Active site distorted → can\'t bind substrate properly\n- Effect: Vmax DECREASES, Km UNCHANGED\n- Cannot be overcome by adding more substrate\n- Example: Cyanide non-competitively inhibits cytochrome c oxidase in the electron transport chain\n- On a Lineweaver-Burk plot: y-intercept shifts (lower Vmax), x-intercept unchanged',
        author: 'Priya S.'
      },
      {
        content: 'Memory trick that helped me:\n- **Competitive** = the inhibitor is in **competition** with substrate at the same site → more substrate wins\n- **Non-competitive** = inhibitor is **not competing** for the active site → extra substrate does nothing\n\nAlso worth knowing: **irreversible inhibition** is when the inhibitor permanently binds (e.g., aspirin irreversibly inhibits COX enzymes; nerve agents inhibit acetylcholinesterase). These won\'t appear as competitive/non-competitive in the traditional sense.',
        author: 'David O.'
      },
      {
        content: 'To add exam-grade precision that distinguishes A from A*:\n\n**For competitive inhibition**, the correct phrasing is that Km *appears* to increase (Apparent Km increases). At low substrate concentrations, inhibitor competes effectively; you need more substrate to reach half-Vmax. Since Vmax is unchanged, organisms can overcome competitive inhibitors by increasing substrate concentration — this is why malonate\'s inhibition of succinate dehydrogenase can be relieved.\n\n**For non-competitive**, the inhibitor may bind the enzyme-substrate complex (mixed inhibition) or only the free enzyme. Pure non-competitive inhibitors bind both equally — Km unchanged, Vmax reduced.\n\n**Clinical application**: Aspirin\'s irreversible COX inhibition is why it\'s effective for blood thinning even at low doses — COX must be re-synthesised from scratch. Always link biochemistry to biological or medical application in your answers for top marks.',
        author: 'Dr. Simo René'
      }
    ]
  },

  // ─── Computer Science / ICT ───────────────────────────────────────────────
  {
    title: 'How does encryption work? RSA vs AES explained',
    content: 'I\'ve heard about RSA and AES encryption but I don\'t really understand how they work or when you\'d use each one. My CS teacher mentioned "public key" and "private key" but it went over my head.',
    subject: 'Computer Science / ICT',
    tags: ['encryption', 'cybersecurity', 'A-Level'],
    pinned: false,
    solved: true,
    views: 308,
    replies: [
      {
        content: 'Let me explain both clearly:\n\n**Symmetric encryption (AES — Advanced Encryption Standard):**\n- One key encrypts AND decrypts data\n- FAST — great for large data (files, hard drives, VPN traffic)\n- Problem: you must securely share the key with the recipient — the "key exchange problem"\n- Used for: encrypting files, full-disk encryption (BitLocker), database encryption\n\n**Asymmetric encryption (RSA — Rivest-Shamir-Adleman):**\n- Two mathematically linked keys: **public key** (shared openly) and **private key** (secret)\n- Anyone can ENCRYPT with your public key; only YOU can DECRYPT with your private key\n- SLOW — not practical for large data\n- Used for: key exchange, digital signatures, HTTPS certificate handshakes\n\n**In practice (HTTPS):** RSA is used to securely exchange an AES session key, then all actual data is encrypted with the faster AES. Best of both worlds!',
        author: 'David O.'
      },
      {
        content: 'A helpful analogy for asymmetric encryption:\nImagine a padlock (public key) that anyone can click shut, and only you have the key (private key) to open it. You give padlocks to anyone who wants to send you a secure message — they lock it and send it; only your key opens it.\n\nFor digital signatures it works in reverse: you sign with your PRIVATE key (only you could have signed it), and anyone with your PUBLIC key can verify the signature. This proves authenticity.',
        author: 'Kwame A.'
      },
      {
        content: 'Important addition for A-Level: RSA security relies on the **factoring problem** — multiplying two large primes is trivial, but factoring their product back is computationally infeasible for 2048-bit numbers (would take longer than the age of the universe to brute-force).\n\n**The actual HTTPS/TLS handshake** step by step:\n1. Browser requests the site\'s SSL certificate (contains server\'s public key)\n2. Browser verifies certificate with a Certificate Authority — prevents MITM attacks\n3. Browser generates a random symmetric session key\n4. Browser encrypts that key with server\'s RSA public key\n5. Server decrypts with its RSA private key → both parties share the AES session key\n6. All subsequent traffic is encrypted with fast AES\n\nUnderstanding this handshake distinguishes candidates who truly grasp network security from those who just memorised definitions.',
        author: 'Mr. Fon Henry Wir'
      }
    ]
  },
  {
    title: 'Stack vs heap memory — what\'s the actual difference?',
    content: 'I keep seeing "stack" and "heap" mentioned in programming and CS theory but I don\'t understand the difference. When does memory go on the stack vs the heap? Does this matter for O-Level or is it more A-Level?',
    subject: 'Computer Science / ICT',
    tags: ['memory management', 'data structures', 'A-Level'],
    pinned: false,
    solved: false,
    views: 165,
    replies: [
      {
        content: 'This is more A-Level/university content but it comes up in some O-Level courses. Here\'s the difference:\n\n**Stack:**\n- Automatically managed by the compiler\n- Stores: local variables, function call information, return addresses\n- LIFO structure (Last In, First Out) — like a pile of plates\n- Fast allocation/deallocation (just move the stack pointer)\n- Limited size (usually a few MB) — stack overflow if exceeded\n- Memory freed automatically when a function returns\n\n**Heap:**\n- Manually managed (in languages like C/C++) or garbage-collected (Python, Java, C#)\n- Stores: dynamically allocated objects, data structures of unknown size\n- Slower allocation (need to find free space)\n- Much larger than the stack\n- Memory leaks occur if you forget to free heap memory (C/C++)\n\n**Quick rule**: If you know the size at compile time and it\'s short-lived → stack. If size is dynamic or it needs to outlive a function → heap.',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'Binary search vs linear search — when should I use each?',
    content: 'We\'re studying searching algorithms and I understand how binary search works (dividing in half each time), but when is it actually better than linear search? What\'s the Big O notation for each?',
    subject: 'Computer Science / ICT',
    tags: ['algorithms', 'searching', 'Big O', 'O-Level'],
    pinned: false,
    solved: true,
    views: 241,
    replies: [
      {
        content: 'Great question! Here\'s a clear comparison:\n\n**Linear Search:**\n- Checks each element one by one from the start\n- Time complexity: **O(n)** — worst case checks every element\n- Works on: any list, sorted or unsorted\n- Best for: small lists, unsorted data, or when you only search occasionally\n\n**Binary Search:**\n- Repeatedly halves the search space\n- Time complexity: **O(log n)** — 1,000,000 items needs at most ~20 comparisons!\n- Requirement: **list must be SORTED first**\n- Best for: large sorted lists searched repeatedly\n\n**The catch**: sorting first costs O(n log n). So if you\'re only searching once, linear search may be faster overall. Binary search pays off when you search the same sorted list many times.\n\nExample: searching a phone book of 1 billion names — linear = up to 1 billion checks; binary = at most ~30 checks!',
        author: 'Kwame A.'
      },
      {
        content: 'Also worth mentioning for the exam: **hash tables** give O(1) average lookup time (even faster than binary search) for key-based searches. But they require extra memory and don\'t maintain sorted order. Different tools for different jobs!',
        author: 'David O.'
      }
    ]
  },

  // ─── Mathematics ──────────────────────────────────────────────────────────
  {
    title: 'Trigonometry identities — I can never remember sin²θ + cos²θ = 1 and the rest',
    content: 'There are so many trig identities and I just can\'t memorise them all. Is there a way to derive them or a trick for remembering? We have sin²θ + cos²θ = 1, but then there\'s tan, double angle formulas etc.',
    subject: 'Mathematics',
    tags: ['trigonometry', 'identities', 'A-Level'],
    pinned: false,
    solved: true,
    views: 297,
    replies: [
      {
        content: 'Here\'s the key insight: **you don\'t need to memorise all of them — you can derive them from a few basics.**\n\n**The ONE identity to memorise:** sin²θ + cos²θ = 1\n\nFrom this, divide everything by cos²θ → **tan²θ + 1 = sec²θ**\nDivide by sin²θ → **1 + cot²θ = cosec²θ**\n\n**Compound angle formulae** (these ARE worth memorising):\n- sin(A+B) = sinA cosB + cosA sinB\n- cos(A+B) = cosA cosB − sinA sinB\n\n**Double angle formulae** (derived from above with B=A):\n- sin 2θ = 2 sin θ cos θ\n- cos 2θ = cos²θ − sin²θ = 2cos²θ − 1 = 1 − 2sin²θ\n\nIf you can derive rather than memorise, you\'re much safer in an exam where you might blank on a formula.',
        author: 'Kwame A.'
      },
      {
        content: 'Practical tip: draw the unit circle! Mark angles 0°, 30°, 45°, 60°, 90° and write sin/cos values at each. Once you visualise why sin 90°=1 and cos 90°=0, many identities make intuitive sense rather than being arbitrary facts to memorise.\n\nAlso, for A-Level, keep a formula sheet as you study and test yourself by covering it. Don\'t wait until the week before the exam.',
        author: 'Amara K.'
      }
    ]
  },
  {
    title: 'I\'m getting different answers on integration by parts — what am I doing wrong?',
    content: 'The formula is ∫u dv = uv - ∫v du but I never know which part to call u and which to call dv. I spent an hour on one problem and kept going in circles. Any tips?',
    subject: 'Mathematics',
    tags: ['calculus', 'integration', 'A-Level'],
    pinned: false,
    solved: false,
    views: 189,
    replies: [
      {
        content: 'The LIATE rule tells you which to pick as u:\n\n**L**ogarithms → **I**nverse trig → **A**lgebraic (polynomials) → **T**rigonometric → **E**xponentials\n\nPick the term that appears EARLIER in this list as your u, and the rest becomes dv.\n\nExamples:\n- ∫x·eˣ dx: x is Algebraic, eˣ is Exponential → u = x, dv = eˣ dx\n- ∫x·ln(x) dx: ln(x) is Logarithmic, x is Algebraic → u = ln(x), dv = x dx\n- ∫x²·sin(x) dx: x² is Algebraic, sin(x) is Trig → u = x², dv = sin(x) dx (you\'ll need to apply IBP twice)\n\n**"Going in circles"** usually means you need to use IBP twice and then collect like terms (the integral appears on both sides — move it to one side and solve for it).',
        author: 'Kwame A.'
      },
      {
        content: 'For the circular case — e.g., ∫eˣ sin(x) dx — after applying IBP twice you get:\n∫eˣ sin(x) dx = eˣ sin(x) − eˣ cos(x) − ∫eˣ sin(x) dx\n\nLet I = ∫eˣ sin(x) dx, then:\n2I = eˣ sin(x) − eˣ cos(x)\nI = ½eˣ(sin(x) − cos(x)) + C\n\nThis "trick" of recognising the original integral on the right-hand side is an exam favourite — practice spotting it.',
        author: 'Priya S.'
      }
    ]
  },
  {
    title: 'How do you solve absolute value inequalities? Getting stuck every time',
    content: 'I understand basic inequalities but when there\'s |2x - 3| < 5 or similar problems I don\'t know the method. Do I split into two cases? How does it change for > vs <?',
    subject: 'Mathematics',
    tags: ['algebra', 'inequalities', 'O-Level'],
    pinned: false,
    solved: true,
    views: 178,
    replies: [
      {
        content: 'Yes, you split into cases, but the rule depends on the inequality sign:\n\n**For |f(x)| < k (LESS THAN):**\n→ Solve: **−k < f(x) < k** (single compound inequality)\nExample: |2x − 3| < 5\n→ −5 < 2x − 3 < 5\n→ −2 < 2x < 8\n→ **−1 < x < 4**\n\n**For |f(x)| > k (GREATER THAN):**\n→ Solve TWO separate inequalities: **f(x) > k OR f(x) < −k**\nExample: |2x − 3| > 5\n→ 2x − 3 > 5 → x > 4\n→ OR 2x − 3 < −5 → x < −1\n→ Answer: **x > 4 or x < −1**\n\nMemory trick: **Less than → "and" (middle region); Greater than → "or" (outer regions)**\n\nAlways check with a test value — plug a number from your answer range back in to verify.',
        author: 'Kwame A.'
      }
    ]
  },

  // ─── History ──────────────────────────────────────────────────────────────
  {
    title: 'Main effects of the Industrial Revolution on British society — essay help',
    content: 'I have an essay due on the social and economic effects of the Industrial Revolution. I know the basic facts but I\'m not sure what the most important points are or how to prioritise them. Any guidance?',
    subject: 'History',
    tags: ['Industrial Revolution', 'social history', 'A-Level'],
    pinned: false,
    solved: false,
    views: 143,
    replies: [
      {
        content: 'For an Industrial Revolution effects essay, structure around these key themes:\n\n**Economic effects:**\n- Mass production → factory system replaced cottage industries; dramatic productivity increase\n- Rise of capitalism and a new industrial middle class (factory owners, merchants)\n- Britain became "the workshop of the world" — ~50% of global iron production by 1850\n- Railways (from 1830s) revolutionised transport, reducing costs and opening national markets\n\n**Social effects:**\n- Mass urbanisation: Manchester grew from ~25,000 (1772) to ~300,000 (1850)\n- Terrible working and living conditions: child labour, 14-hour days, slum housing, no sanitation\n- Emergence of the working class → trade unionism, Chartism, early socialist movements\n- Eventually: rising living standards post-1850, Factory Acts, public health reforms\n\n**For analysis**: argue that while the short-term social effects were deeply negative, the long-term economic transformation laid the foundation for modern prosperity and ultimately forced political reform.',
        author: 'Amara K.'
      },
      {
        content: 'Key evidence to use:\n- **Sadler Report (1832)**: documented child labour horrors in textile mills — good primary source reference\n- **Factory Acts (1833, 1844, 1847)**: showed growing state intervention in response to conditions\n- **Engels\' "The Condition of the Working Class in England" (1845)**: contemporary critique of Manchester conditions\n- **Chadwick\'s Sanitary Report (1842)**: average life expectancy in Manchester was 28 — use this stat!\n\nExaminers love specific evidence. General statements about "bad conditions" won\'t score as well as citing the Sadler Report or Manchester life expectancy data.',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'Nazi Germany vs Stalinist USSR — similarities for comparative essay',
    content: 'We need to write a comparative essay on totalitarianism in Nazi Germany and Stalinist USSR. I can see some obvious similarities (secret police, propaganda) but I\'m struggling to structure this. What are the key points to compare?',
    subject: 'History',
    tags: ['totalitarianism', 'Nazi Germany', 'Stalin', 'A-Level'],
    pinned: false,
    solved: false,
    views: 212,
    replies: [
      {
        content: 'Here\'s a structured comparison across key dimensions:\n\n**Similarities (totalitarian features both share):**\n- **Single-party state**: Nazi Party (NSDAP) vs Communist Party of Soviet Union (CPSU)\n- **Secret police terror**: Gestapo (Germany) vs NKVD (USSR) — both used surveillance, arrest, torture\n- **Propaganda**: Goebbels vs Soviet state media — cult of personality, control of all media\n- **Purges**: Night of the Long Knives (1934) vs Stalin\'s Great Purge (1936–38)\n- **Youth indoctrination**: Hitler Youth vs Komsomol\n- **Economic state control**: Four-Year Plan vs Five-Year Plans — both prioritised military production\n\n**Key differences:**\n- **Ideology**: Nazism = racial nationalism + antisemitism; Stalinism = Marxist-Leninist class struggle\n- **Economic system**: Nazi Germany kept private ownership under state direction; USSR nationalised everything\n- **Target groups**: Nazis targeted racial "enemies" (Jews, Roma, disabled); Stalin targeted class enemies, political rivals, ethnic groups\n- **Scale of terror**: Stalin\'s Gulag system held ~18 million; Holocaust killed ~6 million Jews',
        author: 'Amara K.'
      },
      {
        content: 'For the essay structure, I\'d recommend **thematic** comparison rather than "Germany then USSR" separately — that often leads to description rather than analysis.\n\nEach paragraph: make a point about BOTH countries, comparing directly. E.g.: "Both regimes used terror as a tool of social control: in Germany the Gestapo relied on denunciations from the public rather than a large force, while Stalin\'s NKVD executed approximately 750,000 people in 1937-38 alone, targeting perceived political threats within the party itself."\n\nAlso check out Hannah Arendt\'s "The Origins of Totalitarianism" if you want a theoretical framework — examiners love when you reference historiography.',
        author: 'David O.'
      }
    ]
  },

  // ─── Physics ──────────────────────────────────────────────────────────────
  {
    title: 'Newton\'s laws of motion — real world examples for each law?',
    content: 'I can state all three of Newton\'s laws but when exam questions give a scenario I get confused about which law applies. Can someone give really clear, everyday examples for each law?',
    subject: 'Physics',
    tags: ['mechanics', 'Newton\'s laws', 'O-Level'],
    pinned: false,
    solved: true,
    views: 334,
    replies: [
      {
        content: 'Here are real-world examples for each law:\n\n**1st Law (Inertia): "Objects stay at rest or in uniform motion unless acted on by a net force"**\n- Seatbelts: when a car stops suddenly, your body keeps moving forward — inertia\n- A ball rolling on a frictionless surface would roll forever\n- You feel pushed back into your seat when a car accelerates (inertia resisting the change)\n\n**2nd Law: F = ma (net force = mass × acceleration)**\n- Pushing a shopping trolley: double the force → double the acceleration; full trolley (more mass) → less acceleration for same force\n- Braking: F = ma → more braking force means more deceleration\n- A feather and boulder in a vacuum fall at the same rate because F (gravity) is proportional to m: a = F/m = mg/m = g\n\n**3rd Law: "Every action has an equal and opposite reaction"**\n- Rocket propulsion: gas expelled downward → rocket pushed upward\n- Swimming: push water backward → water pushes you forward\n- Standing on the floor: your weight pushes down on floor → floor pushes up on you (normal force)\n- Firing a gun: bullet goes forward → gun recoils backward',
        author: 'Kwame A.'
      },
      {
        content: 'Common exam trap for the 3rd Law: the action-reaction forces act on DIFFERENT objects, so they can\'t cancel each other out. E.g., a horse pulling a cart — the horse pulls the cart forward AND the cart pulls the horse backward. These are 3rd law pairs but act on different objects, so the horse can still move forward (because its feet push the ground and the ground pushes it forward — a different force pair).',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'Work, energy and power calculations — always getting the wrong answer',
    content: 'I struggle with work done and efficiency problems. The formulas seem simple (W = Fd, P = W/t) but I always get units wrong or mess up efficiency calculations. Can someone walk through examples?',
    subject: 'Physics',
    tags: ['energy', 'work', 'power', 'efficiency', 'O-Level'],
    pinned: false,
    solved: true,
    views: 256,
    replies: [
      {
        content: 'Let me walk through each formula with a worked example:\n\n**Work Done: W = F × d × cos(θ)**\n- F = force (N), d = displacement (m), θ = angle between force and motion\n- If force is parallel to motion, cos(0°) = 1, so W = Fd\n- Example: A person pushes a box with 50 N over 3 m → W = 50 × 3 = **150 J**\n\n**Power: P = W/t = Fv**\n- P = power (W = watts), t = time (s)\n- Example: 150 J of work in 5 s → P = 150/5 = **30 W**\n- Or: same force 50 N at velocity 2 m/s → P = 50 × 2 = **100 W**\n\n**Efficiency: η = (useful output energy / total input energy) × 100%**\n- Example: Motor uses 500 J, outputs 350 J of useful work → η = (350/500) × 100 = **70%**\n- The other 30% is wasted as heat/sound\n\n**Unit check**: Always verify — force in N, distance in m → energy in J; divide by seconds → watts.',
        author: 'Priya S.'
      },
      {
        content: 'Common mistake I used to make: confusing work done against gravity (gravitational PE = mgh) with total work done. If you lift an object AND move it horizontally, only the vertical component counts for gravitational PE stored. The horizontal work done against friction is wasted as heat, not stored as PE.\n\nAlso, a common exam question: "A 2 kW motor lifts a 40 kg crate 5 m. How long does it take?" → Work = mgh = 40 × 10 × 5 = 2000 J; Power = W/t → t = W/P = 2000/2000 = **1 second**.',
        author: 'Kwame A.'
      }
    ]
  },

  // ─── Chemistry ────────────────────────────────────────────────────────────
  {
    title: 'Electrolysis — what happens at the anode and cathode? Always mixing them up',
    content: 'I understand that electrolysis uses electricity to break down compounds but I keep mixing up which electrode is positive (anode) and which products form where. Can someone explain with an example?',
    subject: 'Chemistry',
    tags: ['electrolysis', 'electrochemistry', 'O-Level'],
    pinned: true,
    solved: true,
    views: 388,
    replies: [
      {
        content: 'Here\'s the clearest way to remember it:\n\n**Memory trick: AN OX, RED CAT**\n- **AN**ode = **OX**idation (loses electrons)\n- **RED**uction = **CAT**hode (gains electrons)\n\n**Anode (+):** Negative ions (anions) travel toward it. They are OXIDISED (lose electrons to the anode). Example: Cl⁻ → ½Cl₂ + e⁻ (chlorine gas produced at anode)\n\n**Cathode (−):** Positive ions (cations) travel toward it. They are REDUCED (gain electrons from cathode). Example: Cu²⁺ + 2e⁻ → Cu (copper deposited at cathode)\n\n**Worked example — electrolysis of copper(II) sulfate solution with copper electrodes:**\n- Cathode (−): Cu²⁺ + 2e⁻ → Cu (copper deposited; cathode gets heavier)\n- Anode (+): Cu → Cu²⁺ + 2e⁻ (copper dissolves; anode gets lighter)\n- Net result: copper transferred from anode to cathode — this is electroplating/copper refining!',
        author: 'David O.'
      },
      {
        content: 'Important exam point — **selective discharge** when multiple ions are present:\n\nIn electrolysis of brine (sodium chloride solution), you might expect Na⁺ at cathode and Cl⁻ at anode. But:\n- Cathode: H⁺ is discharged instead of Na⁺ (H⁺ is easier to reduce) → hydrogen gas produced\n- Anode: Cl⁻ is discharged instead of OH⁻ at HIGH concentration → chlorine gas produced\n\nThe rule: at the cathode, the ion LOWER in the reactivity series is discharged first. At the anode, the ion present in HIGHER concentration is usually discharged.\n\nThis is the basis of the chlor-alkali industry — brine electrolysis produces chlorine, hydrogen, and sodium hydroxide (NaOH).',
        author: 'Priya S.'
      }
    ]
  },
  {
    title: 'Ionic vs covalent bonding — how do I know which type of bond a compound has?',
    content: 'I can define ionic and covalent bonding but in exam questions asking me to predict the type of bond in a compound I often get it wrong. Is there a reliable rule? What about polar covalent bonds?',
    subject: 'Chemistry',
    tags: ['bonding', 'ionic', 'covalent', 'O-Level'],
    pinned: false,
    solved: true,
    views: 219,
    replies: [
      {
        content: 'Here\'s the reliable rule based on electronegativity difference (ΔEN):\n\n**ΔEN > 1.7** → **Ionic bond** (electron transfer)\n- Metal + non-metal combinations (generally)\n- Examples: NaCl (Na gives e⁻ to Cl), MgO, CaCl₂, KBr\n- Form a lattice structure, high melting points, conduct electricity when dissolved/molten\n\n**ΔEN 0.4–1.7** → **Polar covalent bond** (shared electrons, unequal)\n- Examples: H₂O, HCl, NH₃, CO₂ (each C=O bond is polar, but CO₂ is non-polar overall due to symmetry)\n- Partial charges (δ+ and δ−) create permanent dipoles\n\n**ΔEN < 0.4** → **Non-polar covalent bond** (shared electrons, equal)\n- Same element: H₂, O₂, Cl₂, N₂\n- Different elements with similar electronegativity: CH₄, CCl₄\n\n**Quick rule for O-Level without electronegativity tables:**\n- Metal + Non-metal → Ionic\n- Non-metal + Non-metal → Covalent',
        author: 'Priya S.'
      },
      {
        content: 'Properties help you identify bonding type in questions:\n\n**Ionic compounds:**\n- High melting/boiling point (strong lattice)\n- Brittle (layers crack when displaced, like charges repel)\n- Conduct electricity ONLY when molten or dissolved (ions need to move)\n- Often soluble in water\n\n**Covalent molecules:**\n- Low melting/boiling point (weak intermolecular forces)\n- Do NOT conduct electricity (no free electrons or ions)\n- Often insoluble in water (unless polar, like HCl)\n\n**Giant covalent structures (e.g., diamond, silicon dioxide)** are exceptions — covalent bonding but very high melting points because they form 3D lattices. Don\'t confuse these with simple covalent molecules!',
        author: 'Amara K.'
      }
    ]
  },

  // ─── English ──────────────────────────────────────────────────────────────
  {
    title: 'How to analyse language techniques effectively — English Lit and Language tips',
    content: 'My English teacher keeps saying my analysis is "surface level" and I need to go deeper. I spot the technique (metaphor, alliteration etc.) but I don\'t know what to say after that. How do I analyse language effectively?',
    subject: 'English',
    tags: ['language analysis', 'English Lit', 'essay writing', 'O-Level'],
    pinned: false,
    solved: false,
    views: 267,
    replies: [
      {
        content: 'The key is moving from WHAT → HOW → WHY. Most students stop at "what" (identifying the technique).\n\nUse the **WHAT HOW WHY** framework:\n- **WHAT**: Identify the technique (e.g., "The writer uses a metaphor")\n- **HOW**: Describe what effect it creates in the text (e.g., "comparing war to a \'game\' trivialises the horror...")\n- **WHY**: Link to the author\'s purpose or context (e.g., "...suggesting the soldiers were manipulated into fighting, which reflects Owen\'s anti-war message")\n\nAnother useful structure is **PETER**:\n- **P**oint → **E**vidence (quote) → **T**echnique → **E**ffect → **R**eader response/context\n\nSurface: "The writer uses personification."\nDeep: "The writer personifies Death as a visitor who \'knocked\', creating an unsettling domesticity around mortality. This subverts expectations — death becomes ordinary and unavoidable rather than dramatic, reflecting the poem\'s theme of life\'s fragility."',
        author: 'Amara K.'
      },
      {
        content: 'Word-level analysis is where marks are won or lost. Don\'t just quote a full sentence — zoom in on specific words:\n\n❌ Weak: "The writer uses descriptive language: \'the dark, cold, silent night\' creates atmosphere."\n✓ Strong: "The triple of \'dark, cold, silent\' creates a sense of absolute isolation through sensory deprivation — the absence of light, warmth and sound strips the scene of comfort, reflecting the speaker\'s emotional emptiness."\n\nAlso, always embed quotes within your sentences rather than dropping them in. Instead of: \'The writer says "the sea was angry."  This shows the sea is stormy.\' — write: \'The sea\'s personification as "angry" projects human emotion onto nature, suggesting the speaker\'s own turmoil is reflected in the external world.\'',
        author: 'David O.'
      }
    ]
  },
  {
    title: 'Descriptive writing tips for O-Level — how to score top marks?',
    content: 'My descriptive writing always gets average marks. I describe things but my teacher says I need more "sophistication." What techniques do high-scoring students use? Any examples I could learn from?',
    subject: 'English',
    tags: ['creative writing', 'descriptive writing', 'O-Level'],
    pinned: false,
    solved: true,
    views: 193,
    replies: [
      {
        content: 'Here\'s what separates average from top-mark descriptive writing:\n\n**1. Vary your sentence structure** — short sentences create impact; long ones build atmosphere:\n"She ran. The darkness pressed in from all sides, thick and suffocating, swallowing the last traces of light as she stumbled blindly forward. Then: silence."\n\n**2. Use ALL five senses** — most students only describe what they see:\n- Sight: "the flickering amber glow"\n- Sound: "leaves whispering accusations"\n- Touch: "the rough stone tore at her palms"\n- Smell: "petrol and burnt rubber hung in the air"\n- Taste: "blood copper on her tongue"\n\n**3. Show, don\'t tell** — instead of "she was scared," show the fear:\n❌ "She was scared."\n✓ "Her fingers wouldn\'t stop trembling. She pressed them flat against the door."\n\n**4. Use figurative language purposefully** — one excellent metaphor beats five weak ones:\n✓ "The city was a throat that swallowed you whole."\n\n**5. Vary your vocabulary** — use a thesaurus, but only for words you understand.',
        author: 'Amara K.'
      },
      {
        content: 'Opening and closing paragraphs are disproportionately important for marks — examiners read hundreds of scripts and a strong opening grabs attention.\n\n**Instead of starting with weather** (the most clichéd opening): "It was a cold, dark night..." → try starting in media res (in the middle of action): "The door handle was already cold when she touched it."\n\n**Strong closings often echo the opening** — creating a sense of circularity. If you opened with an image of light, end with darkness (or vice versa) to create a satisfying structure.\n\nPractice writing opening paragraphs every day for a week — 10-minute writing sprints. The quality of your openings will improve dramatically.',
        author: 'Priya S.'
      }
    ]
  },

  // ─── Geography ────────────────────────────────────────────────────────────
  {
    title: 'Causes and effects of climate change — how to structure this for exams',
    content: 'I have so much information on climate change but I\'m not sure how to organise it for exam questions. What are the most important causes and effects to know? Also what\'s the difference between natural and human causes?',
    subject: 'Geography',
    tags: ['climate change', 'global warming', 'O-Level'],
    pinned: false,
    solved: false,
    views: 301,
    replies: [
      {
        content: 'Organise your answer around this framework:\n\n**Natural causes of climate change:**\n- Milankovitch cycles: changes in Earth\'s orbit/tilt affecting solar energy received\n- Volcanic eruptions: release CO₂ and SO₂ (can actually cool temporarily by blocking sunlight)\n- Solar output variations: sunspot cycles affect solar radiation\n- Historical: ice ages were caused by natural cycles\n\n**Human causes (enhanced greenhouse effect):**\n- Burning fossil fuels: CO₂ emissions (main cause — responsible for ~70% of warming)\n- Deforestation: removes carbon sinks; trees absorb CO₂\n- Agriculture: methane from livestock (cattle), rice paddies; nitrous oxide from fertilisers\n- Industrial processes: cement production, HFCs from refrigerants\n- Urbanisation: heat island effect\n\n**Effects (structure as short-term / long-term or local / global):**\n- Rising sea levels (thermal expansion + ice melt) → flooding of low-lying areas (Bangladesh, Maldives)\n- More extreme weather: stronger hurricanes, more droughts, flooding\n- Ecosystem disruption: coral bleaching, species migration/extinction\n- Food security: shifting growing zones, crop failures\n- Human displacement: climate refugees (est. 200 million by 2050)',
        author: 'David O.'
      },
      {
        content: 'For higher-mark questions, always include **data and case studies**:\n\n**Data:**\n- Global temperature has risen ~1.2°C since pre-industrial levels (IPCC 2021)\n- CO₂ levels: 280 ppm pre-industrial → 420 ppm today (highest in 800,000 years)\n- Arctic sea ice declining ~13% per decade\n\n**Case studies:**\n- **Maldives**: average elevation 1.5m; threatened by sea level rise → government bought land in India as contingency\n- **Sahel (Africa)**: desertification linked to reduced rainfall → food insecurity and conflict\n- **Great Barrier Reef**: 50% bleaching events since 2016 due to warming ocean temperatures\n\nExaminers want to see you can apply knowledge to real places and situations, not just recall general information.',
        author: 'Amara K.'
      }
    ]
  },
  {
    title: 'Plate tectonics and earthquake formation — struggling to explain the mechanisms',
    content: 'I know the plates move and earthquakes happen at boundaries but I always lose marks on "explain how" questions. Can someone explain the mechanics of how earthquakes form at different plate boundaries?',
    subject: 'Geography',
    tags: ['plate tectonics', 'earthquakes', 'physical geography', 'O-Level'],
    pinned: false,
    solved: true,
    views: 248,
    replies: [
      {
        content: 'The key to earthquake mechanism questions is explaining the PROCESS, not just the result. Here\'s how earthquakes form at each boundary type:\n\n**Conservative (Transform) boundary** — most earthquakes:\n- Two plates slide PAST each other horizontally\n- Friction causes plates to lock (stick) and stress builds up\n- When stress exceeds friction, plates suddenly jerk forward, releasing energy as seismic waves\n- Example: San Andreas Fault (California) — Pacific Plate slides NW, North American Plate SE\n- Earthquakes but NO volcanoes at this boundary type\n\n**Destructive (Convergent) boundary:**\n- Dense oceanic plate subducts (sinks) beneath less dense continental plate\n- Friction as plates scrape against each other → earthquakes along the subduction zone\n- Subducted plate melts → magma rises → volcanoes above\n- Example: Japan — Pacific Plate subducting beneath Eurasian Plate (caused 2011 Tōhoku earthquake, M9.1)\n\n**Constructive (Divergent) boundary:**\n- Plates move APART → molten rock (magma) fills the gap\n- Earthquakes here are usually SHALLOW and low magnitude\n- Example: Mid-Atlantic Ridge, Iceland',
        author: 'Kwame A.'
      },
      {
        content: 'For 4+ mark questions, use this structure:\n1. Name the boundary type\n2. Describe the plate movement\n3. Explain the mechanism (what causes stress/friction)\n4. Explain how seismic energy is released\n5. Link to specific features/hazards\n\nAlso useful: know the difference between **focus** (where earthquake originates underground) and **epicentre** (point on the surface directly above the focus). Shallow-focus earthquakes (<70km) cause most damage. The 2011 Japan earthquake had a focus ~30km deep, which is why the shaking was so severe and generated the tsunami.',
        author: 'David O.'
      }
    ]
  },

  // ─── Economics ────────────────────────────────────────────────────────────
  {
    title: 'Supply and demand — I understand the graphs but not how to apply them',
    content: 'I can draw supply and demand diagrams but when a question gives a real scenario (like "oil prices rise") I don\'t know how to figure out what shifts. Can someone walk through how to analyse a market change?',
    subject: 'Economics',
    tags: ['microeconomics', 'supply and demand', 'O-Level'],
    pinned: false,
    solved: true,
    views: 276,
    replies: [
      {
        content: 'Here\'s a systematic approach for any supply/demand question:\n\n**Step 1: Is the change affecting demand or supply?**\n- Changes to CONSUMERS → affects demand\n- Changes to PRODUCERS (costs, technology) → affects supply\n\n**Step 2: Does the factor increase or decrease it?**\n- **Demand shifters** (PIRATES mnemonic): Price of related goods, Income, Advertising/tastes, Related goods (complements/substitutes), Expectations, Size of population, Seasons\n- **Supply shifters**: Costs of production, Technology, Number of producers, Government policy, Expectations\n\n**Step 3: Which direction does the curve shift?**\n- Increase → curve shifts RIGHT; Decrease → shifts LEFT\n\n**Step 4: State the new equilibrium**\n- New price and quantity\n\n**Worked example — oil prices rise:**\n- Oil is an input cost for manufacturers → supply of manufactured goods DECREASES\n- Supply curve shifts LEFT\n- New equilibrium: higher price, lower quantity\n- Also: oil is an input for transport → demand for goods may fall if consumer incomes fall → demand shifts left too',
        author: 'Kwame A.'
      },
      {
        content: 'Common traps students fall into:\n\n**Trap 1: Moving along the curve vs shifting the curve**\n- A change in the good\'s OWN price → move ALONG the demand curve (change in quantity demanded)\n- A change in ANYTHING ELSE → SHIFT the demand curve (change in demand)\n\n**Trap 2: Complements vs substitutes confusion**\n- **Complements**: used together (cars and petrol). If car prices rise → demand for cars falls → demand for petrol falls too (same direction)\n- **Substitutes**: alternatives (butter and margarine). If butter price rises → demand for butter falls → demand for margarine RISES (opposite direction)\n\n**Trap 3: Normal vs inferior goods**\n- **Normal good**: income rises → demand rises (cars, restaurants)\n- **Inferior good**: income rises → demand FALLS (bus tickets, instant noodles) — people switch to better alternatives when they can afford to',
        author: 'Amara K.'
      },
      {
        content: 'Let me add the **Cameroon context** that local examiners appreciate seeing in answers:\n\n**Real example — Mobile Money**: When Orange Money and MTN Mobile Money expanded in Cameroon, demand for traditional bank branches fell for basic transactions (substitute effect). But formalising small businesses through mobile payments *increased* demand for business loans — a complementary demand effect.\n\n**Diagram marking tip**: always label FULLY — axes (Price on Y, Quantity on X), original curves (D₁, S₁), new curves (D₂/S₂ with direction arrows), original equilibrium (E₁: P₁, Q₁), new equilibrium (E₂: P₂, Q₂). Unlabelled diagrams lose marks even when the shift direction is correct. Examiners can only credit what they can clearly *see*.',
        author: 'Mr. Eyango Samuel'
      }
    ]
  },
  {
    title: 'What is inflation and why is it bad? Struggling to understand monetary policy',
    content: 'My economics teacher talks about inflation and interest rates all the time and I\'m lost. What exactly is inflation, why is it a problem, and how do governments control it? This is on my mock paper.',
    subject: 'Economics',
    tags: ['macroeconomics', 'inflation', 'monetary policy', 'O-Level'],
    pinned: false,
    solved: false,
    views: 189,
    replies: [
      {
        content: 'Let me break this down clearly:\n\n**What is inflation?**\n- A sustained rise in the GENERAL price level over time\n- Measured by the Consumer Price Index (CPI) — tracks prices of a "basket" of typical goods\n- Target in the UK: 2% per year (Bank of England target)\n\n**Why is inflation bad?**\n- **Erodes purchasing power**: £100 buys less next year — savings lose value\n- **Uncertainty**: businesses can\'t plan long-term if prices are unpredictable → less investment\n- **Wage-price spiral**: workers demand higher wages → firms raise prices → workers demand more → prices rise again (dangerous cycle)\n- **International competitiveness**: high inflation → UK exports become more expensive abroad → less competitive\n- **Fixed income groups suffer most**: pensioners, people on fixed salaries lose real income\n\n**But some inflation is GOOD:**\n- Encourages spending (why hold cash if it loses value?)\n- Makes debts easier to repay (you repay with "cheaper" money)\n- Deflation (falling prices) is actually MORE dangerous — consumers delay purchases, causing recession',
        author: 'Priya S.'
      },
      {
        content: '**How governments control inflation:**\n\n**Monetary policy (Bank of England):**\n- Raise interest rates → borrowing more expensive → consumers spend less → demand falls → less upward pressure on prices\n- UK raised rates from 0.1% (2021) to 5.25% (2023) to fight post-COVID inflation\n- Also: quantitative tightening — reducing money supply\n\n**Fiscal policy (Government):**\n- Increase taxes → consumers have less disposable income → less spending\n- Cut government spending → reduces demand in economy\n\n**Supply-side policies (long-term):**\n- Increase productivity → firms can produce more at same cost → less inflationary pressure\n\n**Remember**: monetary policy is the MAIN tool used to control inflation in the UK. The Bank of England is independent from government — it can raise rates even when unpopular politically.',
        author: 'David O.'
      }
    ]
  }
];

async function main() {
  console.log('🌱 Seeding Plug database...');

  // Clean up to allow idempotent re-runs
  await prisma.teacherFollow.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.quizResult.deleteMany({});
  await prisma.studyLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.reply.deleteMany({});
  await prisma.thread.deleteMany({});
  await prisma.note.deleteMany({});
  console.log('✅ Cleared existing seed data');

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

  // Create teacher users with profiles
  const teacherSeedData = [
    {
      user: { name: 'Dr. Ngo Paul Brice', email: 'paul.ngo@auraprep.com', points: 1890, streak: 14 },
      profile: {
        subjects: ['Mathematics', 'Physics'],
        town: 'Yaoundé',
        school: 'Lycée Général Leclerc de Yaoundé',
        jobStatus: 'Professor',
        bio: 'Mathematics and Physics Professor with 15+ years of experience preparing students for GCE O-Level and A-Level examinations. Over 300 students guided to distinction grades. Specialised in problem-solving techniques and exam strategy.',
        verified: true,
        available: true,
        rating: 4.8,
        ratingCount: 47,
      },
    },
    {
      user: { name: 'Mrs. Ekonde Grace Mbi', email: 'grace.ekonde@auraprep.com', points: 1240, streak: 9 },
      profile: {
        subjects: ['Biology', 'Chemistry'],
        town: 'Douala',
        school: 'GBHS Deido',
        jobStatus: 'Teacher',
        bio: 'Senior Biology and Chemistry teacher passionate about making science accessible. I use practical demonstrations, diagrams, and real-world examples to reinforce difficult concepts. All levels welcome.',
        verified: true,
        available: true,
        rating: 4.6,
        ratingCount: 31,
      },
    },
    {
      user: { name: 'Mr. Fon Henry Wir', email: 'henry.fon@auraprep.com', points: 2100, streak: 21 },
      profile: {
        subjects: ['Computer Science / ICT'],
        town: 'Douala',
        school: 'GBHS Bonanjo',
        jobStatus: 'Teacher',
        bio: 'ICT teacher and practising software developer. I bridge the gap between exam theory and real-world programming. Students learn to code, debug, and think like engineers while still mastering their syllabus.',
        verified: false,
        available: true,
        rating: 4.9,
        ratingCount: 28,
      },
    },
    {
      user: { name: 'Miss Tchamba Laure Nji', email: 'laure.tchamba@auraprep.com', points: 1560, streak: 11 },
      profile: {
        subjects: ['English Language / Literature', 'History'],
        town: 'Yaoundé',
        school: 'Bilingual Grammar School Yaoundé',
        jobStatus: 'Teacher',
        bio: 'English and History specialist. GCE A-Level examiner for 5 years. I help students master essay structure, analytical writing, and source evaluation to achieve distinction grades consistently.',
        verified: true,
        available: true,
        rating: 4.7,
        ratingCount: 52,
      },
    },
    {
      user: { name: 'Mr. Bello Hamidu', email: 'bello.hamidu@auraprep.com', points: 870, streak: 6 },
      profile: {
        subjects: ['Physics', 'Mathematics'],
        town: 'Bafoussam',
        school: 'Lycée Technique de Bafoussam',
        jobStatus: 'Tutor',
        bio: 'Physics and Maths tutor offering intensive revision sessions and past paper analysis. My systematic approach breaks complex problems into clear steps — students consistently improve 2-3 grades.',
        verified: false,
        available: true,
        rating: 4.5,
        ratingCount: 19,
      },
    },
    {
      user: { name: 'Mrs. Ngwa Bridget Asu', email: 'bridget.ngwa@auraprep.com', points: 720, streak: 4 },
      profile: {
        subjects: ['Geography', 'History'],
        town: 'Bamenda',
        school: 'GBHS Bamenda',
        jobStatus: 'Teacher',
        bio: 'Geography and History teacher dedicated to developing critical thinking through case studies, fieldwork simulations, and document analysis. Specialised in GCE O-Level and Cambridge IGCSE.',
        verified: false,
        available: true,
        rating: 4.4,
        ratingCount: 12,
      },
    },
    {
      user: { name: 'Mr. Eyango Samuel', email: 'samuel.eyango@auraprep.com', points: 1030, streak: 8 },
      profile: {
        subjects: ['Economics', 'Mathematics'],
        town: 'Yaoundé',
        school: '',
        jobStatus: 'Private Instructor',
        bio: 'Economics and Maths private instructor with a background in banking and finance. I make macroeconomics tangible through current events, real data, and case studies from Cameroon and the world.',
        verified: false,
        available: false,
        rating: 4.3,
        ratingCount: 8,
      },
    },
    {
      user: { name: 'Dr. Simo René', email: 'rene.simo@auraprep.com', points: 1680, streak: 16 },
      profile: {
        subjects: ['Chemistry', 'Biology'],
        town: 'Douala',
        school: 'University of Douala (retired)',
        jobStatus: 'Retired Teacher',
        bio: 'Former University of Douala Chemistry professor, now offering A-Level tutoring. Published researcher in organic chemistry. Deep expertise in biochemistry, mechanisms, and laboratory techniques.',
        verified: true,
        available: true,
        rating: 5.0,
        ratingCount: 15,
      },
    },
    {
      user: { name: 'Mr. Tanyi Emmanuel Obi', email: 'emmanuel.tanyi@auraprep.com', points: 1450, streak: 10 },
      profile: {
        subjects: ['English'],
        town: 'Buea',
        school: 'Government Bilingual High School Buea',
        jobStatus: 'Teacher',
        bio: 'English Language and Literature specialist with 10+ years guiding students through GCE O-Level and A-Level. I focus on comprehension, essay craft, and language analysis. My students consistently achieve distinction by mastering how to structure an argument, not just what to say.',
        verified: true,
        available: true,
        rating: 4.7,
        ratingCount: 23,
      },
    },
    {
      user: { name: 'Miss Tene Sorelle Djamdjo', email: 'sorelle.tene@auraprep.com', points: 980, streak: 7 },
      profile: {
        subjects: ['Biology', 'Chemistry'],
        town: 'Douala',
        school: 'Lycée de Bassa',
        jobStatus: 'Teacher',
        bio: 'Biology and Chemistry teacher known for making complex topics visual. I use diagrams, models, and mnemonics to help students build lasting understanding. Specialist in genetics, biochemistry, and organic chemistry for O-Level and A-Level.',
        verified: false,
        available: true,
        rating: 4.5,
        ratingCount: 17,
      },
    },
    {
      user: { name: 'Mr. Ndam Clément Wanko', email: 'clement.ndam@auraprep.com', points: 1320, streak: 11 },
      profile: {
        subjects: ['Mathematics'],
        town: 'Ngaoundéré',
        school: 'Lycée Classique de Ngaoundéré',
        jobStatus: 'Teacher',
        bio: 'Pure Mathematics teacher with a passion for helping students who "hate maths" discover they can actually love it. My teaching focuses on building intuition before introducing formulas. Specialist in calculus, statistics, and further mathematics.',
        verified: true,
        available: true,
        rating: 4.6,
        ratingCount: 29,
      },
    },
    {
      user: { name: 'Mrs. Fotso Sylvie Mbouga', email: 'sylvie.fotso@auraprep.com', points: 860, streak: 5 },
      profile: {
        subjects: ['History', 'Geography'],
        town: 'Bafoussam',
        school: 'GBHS Bafoussam',
        jobStatus: 'Teacher',
        bio: 'History and Geography teacher with a talent for bringing the past and the world to life. I use case studies, primary sources, and real maps to develop both subject knowledge and geographical skills for GCE O-Level and IGCSE examinations.',
        verified: false,
        available: true,
        rating: 4.4,
        ratingCount: 14,
      },
    },
    {
      user: { name: 'Mr. Chukwu Felix Onyeama', email: 'felix.chukwu@auraprep.com', points: 1870, streak: 17 },
      profile: {
        subjects: ['Physics', 'Chemistry'],
        town: 'Douala',
        school: 'Collège La Retraite',
        jobStatus: 'Teacher',
        bio: 'Physics and Chemistry double specialist. I bridge theory and experimentation, running virtual lab sessions alongside traditional revision. My students consistently achieve the highest grades in Douala district examinations. Specialist in mechanics, electromagnetism, and organic chemistry.',
        verified: true,
        available: true,
        rating: 4.8,
        ratingCount: 38,
      },
    },
    {
      user: { name: 'Miss Kamdem Aude Vanessa', email: 'aude.kamdem@auraprep.com', points: 1150, streak: 9 },
      profile: {
        subjects: ['Mathematics', 'Economics'],
        town: 'Yaoundé',
        school: 'Lycée Bilingue de Yaoundé',
        jobStatus: 'Tutor',
        bio: 'Mathematics and Economics tutor with a background in finance. I make abstract concepts concrete using data, graphs, and real markets. Whether it\'s calculus or macroeconomics, I connect theory to the real world so students understand — and remember — what they\'ve learned.',
        verified: false,
        available: true,
        rating: 4.5,
        ratingCount: 20,
      },
    },
    {
      user: { name: 'Mr. Enow Peter Epse', email: 'peter.enow@auraprep.com', points: 2250, streak: 19 },
      profile: {
        subjects: ['Computer Science / ICT'],
        town: 'Buea',
        school: 'University of Buea (Part-time)',
        jobStatus: 'Teacher',
        bio: 'Full-stack developer and ICT teacher at the University of Buea. I teach practical programming alongside exam theory — students leave my class knowing how to code, not just how to pass. Python, web development, databases, and networking specialist. Available for intensive revision courses.',
        verified: true,
        available: true,
        rating: 4.9,
        ratingCount: 41,
      },
    },
    {
      user: { name: 'Mrs. Mballa Carine Essomba', email: 'carine.mballa@auraprep.com', points: 730, streak: 4 },
      profile: {
        subjects: ['Biology'],
        town: 'Yaoundé',
        school: 'Lycée d\'Essos',
        jobStatus: 'Teacher',
        bio: 'Biology teacher specialised in human physiology and ecology. I emphasise understanding over memorisation — students who understand how the body works never forget it. I use patient, step-by-step explanations and past-paper practice to ensure every student is exam-ready.',
        verified: false,
        available: true,
        rating: 4.3,
        ratingCount: 11,
      },
    },
    {
      user: { name: 'Mr. Yaya Mohamadou', email: 'mohamadou.yaya@auraprep.com', points: 610, streak: 3 },
      profile: {
        subjects: ['Geography', 'History'],
        town: 'Maroua',
        school: 'Lycée de Maroua',
        jobStatus: 'Teacher',
        bio: 'Geography and History teacher in the Far North Region. I bring a unique perspective to African and world history, incorporating regional case studies that make topics memorable and relevant. GCE O-Level and A-Level specialist with 8 years of experience.',
        verified: false,
        available: true,
        rating: 4.2,
        ratingCount: 9,
      },
    },
    {
      user: { name: 'Miss Atangana Diane Ayuk', email: 'diane.atangana@auraprep.com', points: 1390, streak: 12 },
      profile: {
        subjects: ['English'],
        town: 'Yaoundé',
        school: 'Bilingual High School Yaoundé',
        jobStatus: 'Teacher',
        bio: 'English Language teacher and professional writer. I help students master the art of expression — from narrative essays to argumentative pieces and literary criticism. My approach combines close reading, timed practice, and personalised feedback to build both confidence and skill.',
        verified: true,
        available: true,
        rating: 4.6,
        ratingCount: 26,
      },
    },
    {
      user: { name: 'Mr. Mvondo Jean-Baptiste', email: 'jean.mvondo@auraprep.com', points: 920, streak: 6 },
      profile: {
        subjects: ['Economics'],
        town: 'Yaoundé',
        school: 'Institut Catholique de Yaoundé',
        jobStatus: 'Private Instructor',
        bio: 'Economics instructor with 12 years of experience and a Master\'s in Development Economics from the University of Yaoundé II. I specialise in making macroeconomics accessible through local examples, news analysis, and structured exam technique training.',
        verified: false,
        available: true,
        rating: 4.4,
        ratingCount: 18,
      },
    },
    {
      user: { name: 'Mrs. Njike Estelle Kenne', email: 'estelle.njike@auraprep.com', points: 1760, streak: 14 },
      profile: {
        subjects: ['Chemistry', 'Biology'],
        town: 'Douala',
        school: 'Lycée de New-Bell',
        jobStatus: 'Teacher',
        bio: 'Chemistry and Biology teacher with a PhD candidate in biochemistry. I combine rigorous scientific depth with practical exam strategy. My lessons focus on mechanisms, data analysis, and the kind of precision language that examiners award top marks for. Verified and highly recommended.',
        verified: true,
        available: true,
        rating: 4.7,
        ratingCount: 33,
      },
    },
    {
      user: { name: 'Mr. Fonkwe Thomas Ndi', email: 'thomas.fonkwe@auraprep.com', points: 1080, streak: 8 },
      profile: {
        subjects: ['Mathematics', 'Physics'],
        town: 'Bamenda',
        school: 'GBHS Bamenda',
        jobStatus: 'Teacher',
        bio: 'Mathematics and Physics teacher in Bamenda. My strength is breaking down problems step-by-step so students know exactly where their reasoning went wrong. I specialise in mechanics, algebra, and statistics. Consistent track record of improving students by 2+ grades.',
        verified: false,
        available: true,
        rating: 4.5,
        ratingCount: 22,
      },
    },
    {
      user: { name: 'Mr. Nguenang Boris Kamga', email: 'boris.nguenang@auraprep.com', points: 1180, streak: 9 },
      profile: {
        subjects: ['Computer Science / ICT'],
        town: 'Yaoundé',
        school: 'Lycée Technique de Yaoundé',
        jobStatus: 'Teacher',
        bio: 'ICT teacher and certified network engineer. I teach both the theoretical foundations and practical applications of computer science. From binary arithmetic and algorithms to networking and security, I ensure students are equipped for both the exam hall and the real world.',
        verified: false,
        available: true,
        rating: 4.3,
        ratingCount: 16,
      },
    },
    {
      user: { name: 'Mrs. Obi Chioma Adanna', email: 'chioma.obi@auraprep.com', points: 1540, streak: 13 },
      profile: {
        subjects: ['Economics', 'Mathematics'],
        town: 'Douala',
        school: 'School of Excellence Douala',
        jobStatus: 'Teacher',
        bio: 'Economics and Mathematics teacher at one of Douala\'s top secondary schools. I help students see the deep connections between mathematical thinking and economic analysis. Specialist in microeconomics, statistics, and exam technique for Cambridge IGCSE and GCE examinations.',
        verified: true,
        available: true,
        rating: 4.6,
        ratingCount: 27,
      },
    },
  ];

  const teacherUsers: { id: string; name: string }[] = [];
  for (const td of teacherSeedData) {
    const hp = await bcrypt.hash('teach1234!', 10);
    const tUser = await prisma.user.upsert({
      where:  { email: td.user.email },
      update: {},
      create: { ...td.user, password: hp, level: 'A-Level' },
    });
    await prisma.teacherProfile.upsert({
      where:  { userId: tUser.id },
      update: {},
      create: { userId: tUser.id, ...td.profile },
    });
    teacherUsers.push(tUser);
  }
  console.log(`✅ Teacher profiles seeded (${teacherSeedData.length} teachers)`);

  // Seed built-in notes
  const createdNotes: { id: string; subject: string; title: string }[] = [];
  for (const noteData of NOTES_DATA) {
    const note = await prisma.note.create({
      data: {
        ...noteData,
        sections: noteData.sections as any,
        quiz: noteData.quiz as any,
        isBuiltIn: true,
        userId: demoUser.id,
      },
      select: { id: true, subject: true, title: true },
    });
    createdNotes.push(note);
  }
  console.log(`✅ Built-in notes seeded (${createdNotes.length} notes)`);

  // Seed quiz results for the demo user — spread across the last 7 days
  const noteByTitle = Object.fromEntries(createdNotes.map(n => [n.title, n.id]));
  const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(14, 0, 0, 0); return d; };
  const quizResultData = [
    // Day -6 (Mon)
    { noteId: noteByTitle['Photosynthesis'],                   score: 9,  total: 13, percentage: 69, createdAt: daysAgo(6) },
    // Day -5 (Tue)
    { noteId: noteByTitle['Introduction to ICT'],              score: 14, total: 17, percentage: 82, createdAt: daysAgo(5) },
    { noteId: noteByTitle['Causes of World War II'],           score: 11, total: 15, percentage: 73, createdAt: daysAgo(5) },
    // Day -4 (Wed)
    { noteId: noteByTitle['Quadratic Equations & Functions'],  score: 12, total: 15, percentage: 80, createdAt: daysAgo(4) },
    { noteId: noteByTitle['Photosynthesis'],                   score: 11, total: 13, percentage: 85, createdAt: daysAgo(4) },
    // Day -3 (Thu)
    { noteId: noteByTitle['Computer Networks & the Internet'], score: 13, total: 17, percentage: 76, createdAt: daysAgo(3) },
    // Day -2 (Fri)
    { noteId: noteByTitle['Causes of World War II'],           score: 16, total: 19, percentage: 84, createdAt: daysAgo(2) },
    { noteId: noteByTitle['Quadratic Equations & Functions'],  score: 14, total: 15, percentage: 93, createdAt: daysAgo(2) },
    // Day -1 (Sat)
    { noteId: noteByTitle['Introduction to ICT'],              score: 18, total: 19, percentage: 95, createdAt: daysAgo(1) },
    { noteId: noteByTitle['Computer Networks & the Internet'], score: 15, total: 17, percentage: 88, createdAt: daysAgo(1) },
    // Day -0 (Sun / today)
    { noteId: noteByTitle['Quadratic Equations & Functions'],  score: 15, total: 15, percentage: 100, createdAt: daysAgo(0) },
    { noteId: noteByTitle['Photosynthesis'],                   score: 12, total: 13, percentage: 92, createdAt: daysAgo(0) },
  ];
  for (const qr of quizResultData) {
    if (!qr.noteId) continue;
    await prisma.quizResult.create({ data: { ...qr, userId: demoUser.id } });
  }
  console.log(`✅ Quiz results seeded (${quizResultData.length} entries)`);

  // Seed community threads
  const usernameToId = Object.fromEntries([
    ...createdUsers.map(u => [u.name, u.id]),
    ...teacherUsers.map(u => [u.name, u.id]),
  ]);
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
  console.log(`✅ Community threads seeded (${THREADS_DATA.length} threads)`);

  // Seed teacher follow relationships
  const teacherByName = Object.fromEntries(teacherUsers.map(u => [u.name, u.id]));
  const followRelations: { studentId: string; teacherId: string }[] = [
    // Alex Student follows
    { studentId: demoUser.id, teacherId: teacherByName['Dr. Ngo Paul Brice'] },
    { studentId: demoUser.id, teacherId: teacherByName['Mr. Fon Henry Wir'] },
    { studentId: demoUser.id, teacherId: teacherByName['Mrs. Ekonde Grace Mbi'] },
    { studentId: demoUser.id, teacherId: teacherByName['Miss Tchamba Laure Nji'] },
    { studentId: demoUser.id, teacherId: teacherByName['Mr. Enow Peter Epse'] },
    // Amara K. follows
    { studentId: createdUsers[1].id, teacherId: teacherByName['Miss Tchamba Laure Nji'] },
    { studentId: createdUsers[1].id, teacherId: teacherByName['Dr. Simo René'] },
    { studentId: createdUsers[1].id, teacherId: teacherByName['Mr. Tanyi Emmanuel Obi'] },
    { studentId: createdUsers[1].id, teacherId: teacherByName['Miss Atangana Diane Ayuk'] },
    { studentId: createdUsers[1].id, teacherId: teacherByName['Dr. Ngo Paul Brice'] },
    // David O. follows
    { studentId: createdUsers[2].id, teacherId: teacherByName['Mr. Fon Henry Wir'] },
    { studentId: createdUsers[2].id, teacherId: teacherByName['Mr. Eyango Samuel'] },
    { studentId: createdUsers[2].id, teacherId: teacherByName['Mr. Nguenang Boris Kamga'] },
    { studentId: createdUsers[2].id, teacherId: teacherByName['Mrs. Njike Estelle Kenne'] },
    // Priya S. follows
    { studentId: createdUsers[3].id, teacherId: teacherByName['Mrs. Ekonde Grace Mbi'] },
    { studentId: createdUsers[3].id, teacherId: teacherByName['Dr. Simo René'] },
    { studentId: createdUsers[3].id, teacherId: teacherByName['Miss Tene Sorelle Djamdjo'] },
    { studentId: createdUsers[3].id, teacherId: teacherByName['Mrs. Mballa Carine Essomba'] },
    { studentId: createdUsers[3].id, teacherId: teacherByName['Mrs. Njike Estelle Kenne'] },
    // Kwame A. follows
    { studentId: createdUsers[4].id, teacherId: teacherByName['Mr. Ndam Clément Wanko'] },
    { studentId: createdUsers[4].id, teacherId: teacherByName['Mr. Fonkwe Thomas Ndi'] },
    { studentId: createdUsers[4].id, teacherId: teacherByName['Mr. Chukwu Felix Onyeama'] },
    { studentId: createdUsers[4].id, teacherId: teacherByName['Mrs. Obi Chioma Adanna'] },
  ];
  for (const rel of followRelations) {
    if (rel.teacherId) {
      await prisma.teacherFollow.create({ data: rel }).catch(() => {});
    }
  }
  console.log('✅ Teacher follow relationships seeded');

  // Seed timetable sessions — current week + next week
  const todayDate = new Date();
  const getDay = (offset: number) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + offset);
    return d.toISOString().split('T')[0];
  };
  const sessionData = [
    // Past days (completed)
    { subject: 'Mathematics', date: getDay(-6), time: '09:00', endTime: '10:30', completed: true, notes: 'Quadratic equations & parabolas' },
    { subject: 'Biology', date: getDay(-6), time: '14:00', endTime: '15:00', completed: true, notes: 'Photosynthesis light reactions' },
    { subject: 'Computer Science / ICT', date: getDay(-5), time: '10:00', endTime: '11:30', completed: true, notes: 'OSI model & protocols' },
    { subject: 'History', date: getDay(-4), time: '09:00', endTime: '10:00', completed: true, notes: 'Treaty of Versailles' },
    { subject: 'Chemistry', date: getDay(-4), time: '15:00', endTime: '16:30', completed: true, notes: 'Ionic vs covalent bonding' },
    { subject: 'Physics', date: getDay(-3), time: '11:00', endTime: '12:30', completed: true, notes: "Newton's laws of motion" },
    { subject: 'English', date: getDay(-3), time: '16:00', endTime: '17:00', completed: true, notes: 'Language analysis techniques' },
    { subject: 'Geography', date: getDay(-2), time: '09:00', endTime: '10:00', completed: true, notes: 'Climate change causes' },
    { subject: 'Economics', date: getDay(-2), time: '14:00', endTime: '15:30', completed: true, notes: 'Supply and demand graphs' },
    { subject: 'Mathematics', date: getDay(-1), time: '10:00', endTime: '11:30', completed: true, notes: 'Trigonometry identities revision' },
    // Today & upcoming (incomplete)
    { subject: 'Biology', date: getDay(0), time: '09:00', endTime: '10:00', completed: false, notes: 'Aerobic vs anaerobic respiration' },
    { subject: 'Computer Science / ICT', date: getDay(0), time: '14:00', endTime: '15:30', completed: false, notes: 'Binary search algorithms' },
    { subject: 'History', date: getDay(1), time: '09:00', endTime: '10:30', completed: false, notes: 'WWII causes essay plan' },
    { subject: 'Physics', date: getDay(1), time: '15:00', endTime: '16:00', completed: false, notes: 'Work, energy and power' },
    { subject: 'Chemistry', date: getDay(2), time: '10:00', endTime: '11:00', completed: false, notes: 'Electrolysis — anode/cathode' },
    { subject: 'English', date: getDay(2), time: '16:00', endTime: '17:00', completed: false, notes: 'Descriptive writing practice' },
    { subject: 'Mathematics', date: getDay(3), time: '09:00', endTime: '10:30', completed: false, notes: 'Integration by parts' },
    { subject: 'Geography', date: getDay(4), time: '11:00', endTime: '12:00', completed: false, notes: 'Plate tectonics essay' },
    { subject: 'Economics', date: getDay(4), time: '15:00', endTime: '16:00', completed: false, notes: 'Inflation and monetary policy' },
  ];
  for (const s of sessionData) {
    await prisma.session.create({ data: { ...s, userId: demoUser.id } });
  }
  console.log(`✅ Timetable sessions seeded (${sessionData.length} sessions)`);

  // Seed study logs — last 3 weeks for rich chart data
  const studyLogData = [
    // Week -3
    { subject: 'Mathematics',            hours: 2,   date: getDay(-20) },
    { subject: 'Biology',                hours: 1.5, date: getDay(-19) },
    { subject: 'Computer Science / ICT', hours: 2.5, date: getDay(-18) },
    { subject: 'History',                hours: 1,   date: getDay(-17) },
    { subject: 'Physics',                hours: 2,   date: getDay(-16) },
    { subject: 'Chemistry',              hours: 1.5, date: getDay(-15) },
    { subject: 'English',                hours: 1,   date: getDay(-14) },
    // Week -2
    { subject: 'Mathematics',            hours: 3,   date: getDay(-13) },
    { subject: 'Geography',              hours: 1.5, date: getDay(-12) },
    { subject: 'Biology',                hours: 2.5, date: getDay(-11) },
    { subject: 'Economics',              hours: 1,   date: getDay(-10) },
    { subject: 'Computer Science / ICT', hours: 2,   date: getDay(-9)  },
    { subject: 'History',                hours: 1.5, date: getDay(-8)  },
    { subject: 'Mathematics',            hours: 2,   date: getDay(-7)  },
    // Week -1 (this week so far)
    { subject: 'Mathematics',            hours: 2.5, date: getDay(-6) },
    { subject: 'Biology',                hours: 1.5, date: getDay(-5) },
    { subject: 'Computer Science / ICT', hours: 3,   date: getDay(-4) },
    { subject: 'History',                hours: 2,   date: getDay(-3) },
    { subject: 'Physics',                hours: 1.5, date: getDay(-2) },
    { subject: 'Chemistry',              hours: 2,   date: getDay(-1) },
    { subject: 'Mathematics',            hours: 1.5, date: getDay(0)  },
    { subject: 'Biology',                hours: 1,   date: getDay(0)  },
  ];
  for (const log of studyLogData) {
    await prisma.studyLog.create({ data: { ...log, userId: demoUser.id } });
  }
  console.log(`✅ Study logs seeded (${studyLogData.length} entries)`);

  // Seed badges
  const badgeData = [
    { name: 'First Steps',     description: 'Completed your first study session',        emoji: '👣', userId: demoUser.id },
    { name: 'Quiz Master',     description: 'Scored 100% on a quiz',                     emoji: '🎯', userId: demoUser.id },
    { name: 'Week Warrior',    description: 'Maintained a 7-day streak',                 emoji: '🔥', userId: demoUser.id },
    { name: 'Note Ninja',      description: 'Read 10 complete notes',                    emoji: '📚', userId: demoUser.id },
    { name: 'Community Star',  description: 'Received 10 likes on a post',               emoji: '⭐', userId: demoUser.id },
    { name: 'Science Ace',     description: 'Completed all Biology quizzes',             emoji: '🔬', userId: demoUser.id },
    { name: 'Early Bird',      description: 'Studied before 8am three times',            emoji: '🌅', userId: demoUser.id },
    { name: 'Night Owl',       description: 'Studied after 10pm three times',            emoji: '🦉', userId: demoUser.id },
    { name: 'Maths Genius',    description: 'Scored A* on 3 Maths quizzes in a row',     emoji: '📐', userId: demoUser.id },
    { name: 'History Buff',    description: 'Completed all History notes and quizzes',   emoji: '📜', userId: demoUser.id },
  ];
  for (const badge of badgeData) {
    await prisma.badge.upsert({ where: { userId_name: { userId: badge.userId, name: badge.name } }, update: {}, create: badge });
  }
  console.log('✅ Badges seeded');

  console.log('\n🎉 Seed complete! Login with: alex@auraprep.com / demo1234!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
