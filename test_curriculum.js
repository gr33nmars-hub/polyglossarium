import { curriculum } from './web/src/data/curriculum.js';

console.log(`Categories: ${curriculum.length}`);
console.log(`Topics: ${curriculum.reduce((sum, cat) => sum + cat.topics.length, 0)}`);
console.log(`First category: ${curriculum[0].category}`);
console.log(`Last category: ${curriculum[curriculum.length-1].category}`);
console.log(`First topic: ${curriculum[0].topics[0].title}`);
console.log(`Last topic: ${curriculum[curriculum.length-1].topics[curriculum[curriculum.length-1].topics.length-1].title}`);
