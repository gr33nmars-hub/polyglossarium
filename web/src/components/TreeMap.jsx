import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { curriculum } from '../data/curriculum';
import { topicDescriptions } from '../data/topicDescriptions';
import { X, Maximize2, Home, ExternalLink } from 'lucide-react';

// Function to generate category introductions
const getCategoryIntro = (categoryName) => {
    const intros = {
        'Метанавык': 'Метанавыки — это фундаментальные способности, которые позволяют эффективно учиться, мыслить и решать проблемы в любой области знаний. Они формируют основу для всех остальных навыков и определяют способность человека адаптироваться к новым вызовам. Развитие метанавыков критически важно для интеллектуальной независимости и непрерывного самообразования.\n\nКритическое мышление учит анализировать информацию, выявлять логические ошибки и когнитивные искажения, принимать обоснованные решения на основе фактов, а не эмоций. Научный метод дает систематический подход к познанию через наблюдение, формулирование гипотез и проверку их экспериментами. Для углубленного изучения рекомендуется [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/), где представлены фундаментальные работы по эпистемологии и логике.\n\nЭти инструменты делают обучение осознанным и результативным, позволяя не просто запоминать факты, а понимать глубинные принципы и применять знания в новых контекстах. Владение метанавыками — это ключ к самостоятельному обучению и интеллектуальной независимости. Практические упражнения и методики доступны на [LessWrong: Rationality](https://www.lesswrong.com/) и [Khan Academy](https://www.khanacademy.org/).',
        
        'Математика': 'Математика — универсальный язык науки и технологий, позволяющий описывать закономерности мира через абстрактные структуры и логические связи. От простой арифметики до сложных дифференциальных уравнений — математика дает инструменты для моделирования реальности. Это фундаментальная дисциплина, без которой невозможно современное научное и технологическое развитие.\n\nАлгебра учит работать с абстракциями и находить неизвестные величины. Математический анализ описывает изменения и движение, лежит в основе физики и инженерии. Линейная алгебра необходима для машинного обучения, компьютерной графики и квантовой механики. Теория вероятностей и статистика позволяют работать с неопределенностью и извлекать смысл из данных. Визуальное понимание математических концепций превосходно представлено на канале [3Blue1Brown](https://www.youtube.com/c/3blue1brown).\n\nМатематика развивает строгое мышление, способность видеть глубинные паттерны в хаосе данных и решать сложные задачи через декомпозицию на простые элементы. Это не просто набор формул, а способ мышления о структуре реальности. Для систематического изучения рекомендуются курсы [MIT OpenCourseWare](https://ocw.mit.edu/) и справочник [Wolfram MathWorld](https://mathworld.wolfram.com/).',
        
        'Физика': 'Физика изучает фундаментальные законы природы — от движения планет до поведения элементарных частиц. Она объясняет, как устроена Вселенная на всех масштабах: от квантовых флуктуаций до космологических структур. Физика — это основа всех естественных наук и современных технологий.\n\nКлассическая механика описывает движение макроскопических объектов через законы Ньютона, лагранжеву и гамильтонову формулировки. Электромагнетизм объединяет электричество, магнетизм и свет в единую теорию через уравнения Максвелла. Квантовая механика раскрывает странный мир атомов и частиц, где действуют принципы суперпозиции и неопределенности. Классические лекции доступны в [Feynman Lectures](https://www.feynmanlectures.caltech.edu/).\n\nТеория относительности Эйнштейна показывает, что пространство и время неразрывно связаны, а гравитация — это искривление пространства-времени. Термодинамика и статистическая физика объясняют природу тепла, энтропии и необратимости времени. Понимание физики открывает путь к технологическим прорывам и глубокому осознанию реальности. Современные курсы представлены на [MIT Physics](https://ocw.mit.edu/courses/physics/) и [PhysicsWorld](https://physicsworld.com/).',
        
        'Химия': 'Химия исследует вещество, его структуру, свойства и превращения. Это наука о том, как атомы соединяются в молекулы и как эти молекулы взаимодействуют, создавая все материалы вокруг нас. Химия — это мост между физикой микромира и биологией живых систем.\n\nОбщая химия закладывает фундамент: строение атома, периодическая система элементов, химические связи, стехиометрия реакций. Органическая химия изучает соединения углерода — основу всей живой материи, от простых углеводородов до сложных биомолекул. Физическая химия применяет законы физики к химическим процессам: термодинамика реакций, кинетика, равновесия. Систематическое изучение доступно на [Khan Academy: Chemistry](https://www.khanacademy.org/science/chemistry).\n\nНеорганическая химия охватывает все остальные элементы, координационные соединения, кристаллические структуры. От синтеза новых лекарств до создания передовых материалов — полупроводников, полимеров, катализаторов — химия лежит в основе современных технологий и определяет материальную базу цивилизации. Подробные справочники: [ChemGuide](https://www.chemguide.co.uk/) и [Royal Society of Chemistry](https://www.rsc.org/).',
        
        'Биология': 'Биология изучает жизнь во всех её проявлениях — от молекулярных механизмов клетки до сложных экосистем. Она объясняет, как работают живые организмы, как они эволюционируют и взаимодействуют друг с другом. Биология объединяет химию, физику и информатику для понимания феномена жизни.\n\nКлеточная биология раскрывает устройство основной единицы жизни: ДНК, РНК, белки, органеллы, сигнальные пути. Генетика объясняет наследственность через законы Менделя и современную молекулярную генетику. Эволюционная биология показывает, как естественный отбор, мутации и дрейф генов формируют разнообразие жизни. Научные публикации доступны в [Nature](https://www.nature.com/) и базе данных [NCBI](https://www.ncbi.nlm.nih.gov/).\n\nБиохимия изучает химические процессы в живых организмах: метаболизм, ферменты, энергетические циклы. Физиология описывает работу органов и систем: нервной, эндокринной, сердечно-сосудистой. Экология исследует взаимодействия организмов с окружающей средой. Понимание биологии критически важно для медицины, биотехнологий, сельского хозяйства и сохранения природы. Образовательные курсы: [Khan Academy: Biology](https://www.khanacademy.org/science/biology).',
        
        'Философия': 'Философия задает фундаментальные вопросы о природе реальности, познания, морали и смысла существования. Она учит критически анализировать идеи, выявлять скрытые предпосылки и строить логически последовательные аргументы. Философское мышление — это основа интеллектуальной культуры и рационального дискурса.\n\nМетафизика исследует природу бытия: что существует, что такое время, пространство, причинность, свобода воли. Эпистемология изучает природу знания: как мы познаем мир, что такое истина, как оправдать наши убеждения. Этика анализирует мораль: что делает действия правильными или неправильными, как следует жить. Фундаментальные работы представлены в [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/).\n\nФилософия науки исследует методы и предпосылки научного познания. Философия сознания изучает природу разума и его отношение к мозгу. Политическая философия анализирует справедливость, свободу, права. Философское мышление развивает интеллектуальную честность, глубину понимания и способность видеть скрытые допущения в любых рассуждениях. Дополнительные ресурсы: [Internet Encyclopedia of Philosophy](https://iep.utm.edu/) и [PhilPapers](https://philpapers.org/).',
        
        'Политология': 'Политология изучает власть, государство, политические институты и процессы принятия коллективных решений. Она анализирует, как устроены политические системы, почему одни режимы стабильны, а другие рушатся. Политическая наука объединяет эмпирические исследования с нормативной теорией.\n\nСравнительная политика исследует различные типы политических систем: демократии, авторитарные режимы, федерализм, электоральные системы. Международные отношения изучают взаимодействие государств: войны, дипломатию, международные организации, глобализацию. Политическая теория анализирует концепции власти, легитимности, справедливости. Аналитика доступна на [Council on Foreign Relations](https://www.cfr.org/).\n\nПолитическая экономия исследует связь между экономикой и политикой: как экономические интересы влияют на политику, как институты формируют экономическое развитие. Изучение политических институтов показывает, как конституции, партии, выборы структурируют политический процесс. Понимание политики необходимо для осознанного участия в общественной жизни и критической оценки политических решений. Академические программы: [LSE](https://www.lse.ac.uk/) и [Oxford Politics](https://www.politics.ox.ac.uk/).',
        
        'Экономика': 'Экономика исследует, как общество распределяет ограниченные ресурсы для удовлетворения безграничных потребностей. Она объясняет механизмы рынков, причины экономических кризисов и факторы роста благосостояния. Экономическая наука сочетает математическое моделирование с эмпирическим анализом данных.\n\nМикроэкономика изучает поведение отдельных агентов: потребителей, фирм, рынков. Как формируются цены, как фирмы принимают решения о производстве, как рынки достигают равновесия. Макроэкономика анализирует экономику в целом: ВВП, инфляцию, безработицу, экономические циклы, денежную и фискальную политику. Образовательные курсы: [Khan Academy: Economics](https://www.khanacademy.org/economics-finance-domain).\n\nЭкономическая история показывает, как развивались экономические системы: индустриализация, глобализация, неравенство. Поведенческая экономика изучает, как психологические факторы влияют на экономические решения. Теория игр анализирует стратегические взаимодействия. Экономическая грамотность помогает принимать рациональные решения на всех уровнях — от личных финансов до государственной политики. Данные и исследования: [IMF](https://www.imf.org/) и [World Bank](https://www.worldbank.org/).',
        
        'Социология': 'Социология изучает общество, социальные институты, группы и процессы взаимодействия между людьми. Она объясняет, как формируются социальные нормы, почему возникает неравенство и как происходят социальные изменения. Социология раскрывает скрытые механизмы, управляющие коллективным поведением.\n\nСоциологическая теория предлагает различные перспективы: функционализм видит общество как систему взаимосвязанных частей, конфликтная теория фокусируется на борьбе за ресурсы, символический интеракционизм изучает смыслы в повседневных взаимодействиях. Социальная стратификация анализирует неравенство: классы, статусы, мобильность. Профессиональные ресурсы: [American Sociological Association](https://www.asanet.org/).\n\nСоциология культуры исследует ценности, нормы, символы. Социология организаций изучает бюрократию, корпорации, институты. Социальные движения и изменения показывают, как общества трансформируются. Методы социологического исследования включают опросы, интервью, наблюдения, анализ данных. Социологическое мышление помогает понять скрытые механизмы, управляющие коллективным поведением.',
        
        'Психология': 'Психология исследует психику, поведение, эмоции и когнитивные процессы человека. Она объясняет, как работает восприятие, память, мышление и как формируется личность. Психология объединяет нейробиологию, когнитивную науку и социальные исследования для понимания человеческого поведения.\n\nКогнитивная психология изучает ментальные процессы: внимание, память, решение задач, язык. Нейропсихология связывает мозг и поведение, показывая, как нейронные структуры обеспечивают психические функции. Психология развития исследует изменения на протяжении жизни: от младенчества до старости. Научные публикации доступны через [APA](https://www.apa.org/).\n\nСоциальная психология анализирует, как люди влияют друг на друга: конформизм, убеждение, групповую динамику. Психология личности изучает индивидуальные различия: черты, мотивацию, эмоции. Клиническая психология занимается психическими расстройствами и их лечением. Понимание психологии улучшает самопознание, межличностные отношения и способность влиять на собственное поведение. Популярные ресурсы: [Psychology Today](https://www.psychologytoday.com/).',
        
        'История': 'История изучает прошлое человечества — события, процессы, идеи и структуры, которые сформировали современный мир. Она учит видеть причинно-следственные связи, понимать контекст и критически оценивать источники. Историческое мышление необходимо для понимания настоящего и прогнозирования будущего.\n\nДревняя история охватывает возникновение цивилизаций: Месопотамию, Египет, Грецию, Рим. Средневековье показывает формирование феодализма, роль религии, крестовые походы. Новое время — это эпоха Возрождения, Реформации, научной революции, колониализма. Современная история включает индустриализацию, мировые войны, холодную войну, глобализацию. Энциклопедические ресурсы: [World History Encyclopedia](https://www.worldhistory.org/).\n\nИстория идей прослеживает эволюцию философских, научных, политических концепций. Социальная история фокусируется на повседневной жизни, классах, гендере. Экономическая история анализирует торговлю, технологии, капитализм. Историческое мышление помогает не повторять ошибок прошлого, понимать корни современных проблем и осознанно строить будущее.',
        
        'Лингвистика': 'Лингвистика исследует язык как систему — его структуру, эволюцию и функции в обществе. Она объясняет, как работает грамматика, как дети усваивают язык и как языки влияют на мышление. Лингвистика объединяет гуманитарные и естественнонаучные методы исследования.\n\nФонетика и фонология изучают звуки речи и их систему. Морфология анализирует структуру слов. Синтаксис исследует правила построения предложений. Семантика занимается значением, прагматика — использованием языка в контексте. Историческая лингвистика прослеживает эволюцию языков, родственные связи, языковые изменения. Академические ресурсы доступны через [Linguistic Society of America](https://www.linguisticsociety.org/).\n\nПсихолингвистика изучает, как мозг обрабатывает язык: восприятие речи, производство, усвоение. Социолингвистика анализирует вариативность языка: диалекты, социолекты, языковую политику. Когнитивная лингвистика исследует связь языка и мышления. Понимание лингвистики открывает путь к изучению иностранных языков, глубокому пониманию коммуникации и природы человеческого познания.',
        
        'Антропология': 'Антропология изучает человека во всем его многообразии — биологическом, культурном и социальном. Она исследует происхождение человека, эволюцию культур и разнообразие обществ. Антропология объединяет естественные и социальные науки для целостного понимания человечества.\n\nФизическая антропология изучает биологическую эволюцию человека: ископаемые останки, приматов, генетику популяций. Археология реконструирует прошлые общества через материальные остатки: орудия, поселения, артефакты. Культурная антропология исследует разнообразие культур: верования, ритуалы, родство, экономику. Профессиональные ресурсы: [American Anthropological Association](https://www.americananthro.org/).\n\nЛингвистическая антропология анализирует язык в культурном контексте. Этнография — это метод полевого исследования через погружение в культуру. Антропология показывает, что считается "естественным" в одной культуре, может быть совершенно иным в другой. Антропологический взгляд помогает преодолеть этноцентризм, понять универсальные паттерны человеческого поведения и уважать культурное разнообразие.',
        
        'Информатика': 'Информатика изучает алгоритмы, структуры данных, вычислительные процессы и принципы построения программных систем. Она объясняет, как компьютеры обрабатывают информацию и решают задачи. Информатика — это фундаментальная наука цифровой эпохи, определяющая развитие технологий.\n\nАлгоритмы и структуры данных — это фундамент: сортировка, поиск, графы, деревья, хеш-таблицы. Теория вычислимости исследует границы того, что можно вычислить: машины Тьюринга, сложность алгоритмов, P vs NP. Архитектура компьютеров показывает, как работает железо: процессоры, память, ввод-вывод. Образовательные курсы доступны на [MIT OpenCourseWare: Computer Science](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/).\n\nОперационные системы управляют ресурсами: процессы, память, файловые системы. Сети и протоколы обеспечивают коммуникацию. Базы данных хранят и обрабатывают структурированную информацию. Машинное обучение и искусственный интеллект создают системы, способные учиться и принимать решения. Программирование и алгоритмическое мышление — ключевые навыки цифровой эпохи. Практические ресурсы: [ACM](https://www.acm.org/).',
        
        'Искусство': 'Искусство — это способ познания мира через эстетический опыт, выражение идей и эмоций в визуальных, звуковых и других формах. Оно развивает креативность, чувствительность к красоте и способность видеть глубину в простом. Искусство — это универсальный язык человеческой культуры.\n\nИстория искусства прослеживает эволюцию стилей: от наскальной живописи до современного искусства, от классицизма до абстракционизма. Теория искусства анализирует природу эстетического опыта, критерии красоты, функции искусства в обществе. Различные медиа — живопись, скульптура, архитектура, музыка, кино — имеют свои выразительные средства и техники. Коллекции доступны в [Metropolitan Museum](https://www.metmuseum.org/).\n\nИскусство отражает культуру и эпоху, выражает идеи и эмоции, которые трудно передать словами. Оно развивает визуальную грамотность, способность интерпретировать символы и метафоры. Практика искусства тренирует наблюдательность, воображение, способность видеть необычное в обычном. Понимание искусства обогащает внутренний мир и расширяет границы восприятия реальности. Образовательные курсы: [Khan Academy: Art History](https://www.khanacademy.org/humanities/art-history).'
    };
    
    return intros[categoryName] || 'Эта область знаний охватывает фундаментальные концепции и методы, необходимые для глубокого понимания предмета. Изучение этих модулей формирует прочную основу для дальнейшего развития в данной дисциплине.';
};

// Function to extract links from description
const extractLinks = (description) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(description)) !== null) {
        links.push({ text: match[1], url: match[2] });
    }
    
    return links;
};

// Function to remove markdown links from text
const removeLinks = (text) => {
    return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
};

export default function TreeMap() {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const categoryRefs = useRef({});

    // Calculate total topics
    const totalTopics = curriculum.reduce((sum, cat) => sum + cat.topics.length, 0);

    // Grid configuration
    const CATEGORY_WIDTH = 280;
    const CATEGORY_HEIGHT = 120;
    const TOPIC_WIDTH = 260;
    const TOPIC_HEIGHT = 80;
    const HORIZONTAL_GAP = 40;
    const VERTICAL_GAP = 20;
    const ROOT_TO_CATEGORIES = 100;
    const CATEGORIES_TO_TOPICS = 80;

    const navigateToCategory = useCallback((categoryIndex) => {
        const categoryElement = categoryRefs.current[categoryIndex];
        if (!categoryElement || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const categoryRect = categoryElement.getBoundingClientRect();

        // Calculate position to center the category
        const targetX = containerRect.width / 2 - (categoryRect.left - containerRect.left + categoryRect.width / 2);
        const targetY = containerRect.height / 2 - (categoryRect.top - containerRect.top + categoryRect.height / 2);

        setPosition(constrainPosition({ x: targetX, y: targetY }, scale));
    }, [scale]);

    const handleReset = () => {
        setPosition({ x: 0, y: 0 });
        setScale(1);
        setSelectedTopic(null);
    };

    const constrainPosition = useCallback((newPos, currentScale) => {
        if (!containerRef.current || !contentRef.current) return newPos;
        
        const container = containerRef.current.getBoundingClientRect();
        const content = contentRef.current;
        
        // Get actual content dimensions
        const contentWidth = content.scrollWidth * currentScale;
        const contentHeight = content.scrollHeight * currentScale;
        
        // Calculate boundaries
        // If content is smaller than container, center it
        // If content is larger, allow dragging within bounds
        let minX, maxX, minY, maxY;
        
        if (contentWidth <= container.width) {
            // Content fits horizontally - center it
            minX = maxX = (container.width - contentWidth) / 2;
        } else {
            // Content larger than container - allow dragging
            maxX = 0;
            minX = container.width - contentWidth;
        }
        
        if (contentHeight <= container.height) {
            // Content fits vertically - center it
            minY = maxY = (container.height - contentHeight) / 2;
        } else {
            // Content larger than container - allow dragging
            maxY = 0;
            minY = container.height - contentHeight;
        }
        
        return {
            x: Math.min(maxX, Math.max(minX, newPos.x)),
            y: Math.min(maxY, Math.max(minY, newPos.y))
        };
    }, []);

    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    }, [position]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        requestAnimationFrame(() => {
            const newPos = {
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y
            };
            setPosition(constrainPosition(newPos, scale));
        });
    }, [isDragging, scale, constrainPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(1.3, Math.max(1.0, scale + delta));
        
        if (newScale === scale) return;
        
        // Get mouse position relative to container
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate the point under the mouse in the content coordinate system
        const contentX = (mouseX - position.x) / scale;
        const contentY = (mouseY - position.y) / scale;
        
        // Calculate new position to keep the point under the mouse
        const newPos = {
            x: mouseX - contentX * newScale,
            y: mouseY - contentY * newScale
        };
        
        setScale(newScale);
        setPosition(constrainPosition(newPos, newScale));
    }, [scale, position, constrainPosition]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    return (
        <div 
            className="min-h-screen bg-white text-black relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header */}
            <div className="fixed top-0 left-0 w-full bg-white border-b border-black/10 z-50 px-6 py-4">
                <div className="flex items-center justify-between max-w-[1800px] mx-auto">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">КАРТА ЗНАНИЙ</h1>
                        <p className="font-mono text-xs text-gray-500 mt-1">
                            {curriculum.length} категорий / {totalTopics} модулей • Zoom: {Math.round(scale * 100)}%
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Сбросить позицию"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <a
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-mono text-sm"
                        >
                            <Home className="w-4 h-4" />
                            Главная
                        </a>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="fixed top-[73px] left-0 w-full bg-white backdrop-blur-sm border-b border-black/10 z-40 px-6" style={{ paddingTop: '50px', paddingBottom: '15px' }}>
                <div className="relative flex items-center justify-center gap-0 flex-wrap max-w-[1800px] mx-auto">
                    {curriculum.map((category, index) => (
                        <div key={category.id} className="relative flex items-center">
                            <button
                                onClick={() => navigateToCategory(index)}
                                className="group relative px-3 py-1.5 border border-black/20 hover:border-black hover:bg-black hover:text-white transition-all duration-200 font-mono text-xs uppercase"
                            >
                                <span className="relative z-10">{category.category}</span>
                                <div className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left -z-10" />
                            </button>
                            {/* Connecting line between buttons */}
                            {index < curriculum.length - 1 && (
                                <div className="w-2 h-0.5 bg-black/30" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tree Container */}
            <div 
                ref={containerRef}
                className="overflow-hidden select-none"
                style={{ 
                    height: 'calc(100vh - 125px)',
                    marginTop: '160px',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
            >
                <div
                    ref={contentRef}
                    className="relative"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        willChange: 'transform',
                        width: 'max-content',
                        padding: '100px'
                    }}
                >
                    {/* Root Node */}
                    <div className="flex flex-col items-center">
                        <div className="bg-black text-white p-8 border-4 border-black shadow-lg">
                            <h2 className="font-display text-4xl font-bold uppercase text-center">
                                POLYGLOSSARIUM
                            </h2>
                            <p className="font-mono text-xs text-center mt-2 opacity-70">
                                УНИВЕРСАЛЬНАЯ СИСТЕМА ЗНАНИЙ
                            </p>
                        </div>

                        {/* Vertical line to categories */}
                        <div 
                            className="w-0.5 bg-black"
                            style={{ height: `${ROOT_TO_CATEGORIES}px` }}
                        />

                        {/* Categories Row */}
                        <div className="relative flex items-start" style={{ gap: `${HORIZONTAL_GAP}px` }}>
                            {/* Horizontal line connecting all categories */}
                            <div 
                                className="absolute h-0.5 bg-black"
                                style={{
                                    top: '0',
                                    left: '0',
                                    width: `${curriculum.length * (CATEGORY_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP}px`
                                }}
                            />

                            {curriculum.map((category, catIndex) => {
                                const maxTopicsInRow = 4;
                                const topicsInRows = [];
                                for (let i = 0; i < category.topics.length; i += maxTopicsInRow) {
                                    topicsInRows.push(category.topics.slice(i, i + maxTopicsInRow));
                                }
                                
                                return (
                                    <div key={category.id} className="relative flex flex-col items-center">
                                        {/* Vertical line from horizontal bar to category */}
                                        <div className="w-0.5 h-8 bg-black" />

                                        {/* Category Node */}
                                        <div
                                            ref={(el) => categoryRefs.current[catIndex] = el}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCategory(category);
                                            }}
                                            className="bg-white border-2 border-black p-6 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer shadow-md relative z-10"
                                            style={{
                                                width: `${CATEGORY_WIDTH}px`,
                                                minHeight: `${CATEGORY_HEIGHT}px`
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-xs opacity-60">
                                                    {String(catIndex + 1).padStart(2, '0')}
                                                </span>
                                                <span className="font-mono text-xs opacity-60">
                                                    {category.topics.length}
                                                </span>
                                            </div>
                                            <h3 className="font-display text-lg font-bold uppercase leading-tight">
                                                {category.category}
                                            </h3>
                                        </div>

                                        {/* Vertical line to topics */}
                                        <div 
                                            className="w-0.5 bg-black"
                                            style={{ height: `${CATEGORIES_TO_TOPICS}px` }}
                                        />

                                        {/* Topics Grid Container */}
                                        <div className="relative">
                                            {/* Horizontal line above topics */}
                                            <div 
                                                className="absolute h-0.5 bg-black"
                                                style={{
                                                    top: '0',
                                                    left: '0',
                                                    width: `${Math.min(maxTopicsInRow, category.topics.length) * (TOPIC_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP}px`
                                                }}
                                            />

                                            {/* Topics Grid */}
                                            <div 
                                                className="grid relative"
                                                style={{
                                                    gridTemplateColumns: `repeat(${Math.min(maxTopicsInRow, category.topics.length)}, ${TOPIC_WIDTH}px)`,
                                                    gap: `${VERTICAL_GAP}px ${HORIZONTAL_GAP}px`,
                                                    paddingTop: '8px'
                                                }}
                                            >
                                                {category.topics.map((topic, topicIndex) => {
                                                    const col = topicIndex % maxTopicsInRow;
                                                    const row = Math.floor(topicIndex / maxTopicsInRow);
                                                    const topicsInCurrentRow = Math.min(maxTopicsInRow, category.topics.length - row * maxTopicsInRow);
                                                    
                                                    return (
                                                        <div key={topic.id} className="relative">
                                                            {/* Vertical line from horizontal bar to topic (first row) */}
                                                            {row === 0 && (
                                                                <div 
                                                                    className="absolute w-0.5 bg-black"
                                                                    style={{
                                                                        left: '50%',
                                                                        top: '-8px',
                                                                        height: '8px'
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {/* Horizontal line for subsequent rows */}
                                                            {row > 0 && col === 0 && (
                                                                <div 
                                                                    className="absolute h-0.5 bg-black"
                                                                    style={{
                                                                        top: `-${VERTICAL_GAP / 2}px`,
                                                                        left: '0',
                                                                        width: `${topicsInCurrentRow * (TOPIC_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP}px`
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {/* Vertical line connecting to horizontal line (subsequent rows) */}
                                                            {row > 0 && (
                                                                <div 
                                                                    className="absolute w-0.5 bg-black"
                                                                    style={{
                                                                        left: '50%',
                                                                        top: `-${VERTICAL_GAP / 2}px`,
                                                                        height: `${VERTICAL_GAP / 2}px`
                                                                    }}
                                                                />
                                                            )}
                                                            
                                                            {/* Topic Node */}
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTopic(topic);
                                                                }}
                                                                className="bg-gray-50 border border-black/20 p-4 hover:bg-black hover:text-white hover:border-black transition-all duration-200 cursor-pointer shadow-sm relative z-10"
                                                                style={{
                                                                    width: `${TOPIC_WIDTH}px`,
                                                                    height: `${TOPIC_HEIGHT}px`
                                                                }}
                                                            >
                                                                <div className="font-mono text-xs opacity-50 mb-1">
                                                                    #{topic.id}
                                                                </div>
                                                                <h4 className="font-display text-xs font-semibold leading-tight line-clamp-2">
                                                                    {topic.title}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Topic Detail Modal */}
            <AnimatePresence>
                {selectedTopic && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                        onClick={() => setSelectedTopic(null)}
                    >
                        <div
                            className="bg-white border-2 border-black p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
                            style={{ animation: 'scaleIn 0.2s ease-out' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="font-mono text-xs text-gray-500">
                                        МОДУЛЬ #{selectedTopic.id}
                                    </span>
                                    <h2 className="font-display text-3xl font-bold uppercase mt-2">
                                        {selectedTopic.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTopic(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {topicDescriptions[selectedTopic.id] ? (
                                    <>
                                        {topicDescriptions[selectedTopic.id].description.split('\n\n').map((paragraph, index) => (
                                            <p key={index} className="text-base leading-relaxed font-medium">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-base leading-relaxed font-medium">
                                        {removeLinks(selectedTopic.description)}
                                    </p>
                                )}
                                
                                {extractLinks(selectedTopic.description).length > 0 && (
                                    <div className="pt-4 border-t border-black/10">
                                        <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-3">
                                            Полезные ресурсы
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {extractLinks(selectedTopic.description).map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-center gap-2 px-3 py-2 border border-black/20 hover:bg-black hover:text-white hover:border-black transition-all duration-200 font-mono text-xs"
                                                >
                                                    <ExternalLink className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                                                    <span>{link.text}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Detail Modal */}
            <AnimatePresence>
                {selectedCategory && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <div
                            className="bg-white border-2 border-black p-12 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
                            style={{ animation: 'scaleIn 0.2s ease-out' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
                                        Категория {String(selectedCategory.id + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="font-display text-5xl font-bold uppercase mt-3 leading-tight">
                                        {selectedCategory.category}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-2 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {getCategoryIntro(selectedCategory.category).split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="text-lg font-medium leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
