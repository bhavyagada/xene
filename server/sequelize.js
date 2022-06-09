const mysql = require('mysql2/promise')
const Sequelize = require('sequelize')
const UserModel = require('../models/user')
const ChallengeModel = require('../models/challenge')
const PuzzleModel = require('../models/puzzle')
const UserPuzzlesModel = require('../models/user_puzzles')

const sequelize = new Sequelize({
  host: process.env.DB_URL,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT,
  logging: false
})

const User = UserModel(sequelize, Sequelize)
const Challenge = ChallengeModel(sequelize, Sequelize)
const Puzzle = PuzzleModel(sequelize, Sequelize)
const UserPuzzles = UserPuzzlesModel(sequelize, Sequelize)

Puzzle.belongsTo(Challenge, { foreignKey: 'challengeId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Challenge.hasMany(Puzzle, { foreignKey: 'challengeId', as: 'puzzles', sonDelete: 'CASCADE', onUpdate: 'CASCADE' })

User.belongsToMany(Puzzle, { through: 'UserPuzzles', foreignKey: 'userSub', otherKey: 'puzzleId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
Puzzle.belongsToMany(User, { through: 'UserPuzzles', foreignKey: 'puzzleId', otherKey: 'userSub', onDelete: 'CASCADE', onUpdate: 'CASCADE' })

function getUniqueRandoms(amount, limit) {
  const nums = new Set()
  while (nums.size !== amount) {
    nums.add(getRandomBetween(1, limit))
  }

  return [...nums]
}

function getRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function syncDB() {

  mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  }).then((connection) => {
    return connection.query('CREATE DATABASE IF NOT EXISTS ' + process.env.DB_NAME + ';').then(() => {
      return sequelize.sync({ force: true })
        .then(() => {
          return Challenge.bulkCreate([
          {
            id: 1,
            name: 'Initiated',
            puzzles: [
              {
                id: 1,
                name: 'Print',
                description: 'Hello World!',              
                keys: '["+", "-", "return"]',
                hints: 'Click &nbsp;<span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="width: 60px; position: unset;"> <span class="hg-button hg-standardBtn atom-2" style="display: flex" > <span>input</span> </span></span>&nbsp;&nbsp;and&nbsp;<button type="button" class="v-btn v-btn--flat v-btn--icon v-btn--round theme--dark v-size--x-large teal--text text--accent-3"> <span class="v-btn__content"> <i aria-hidden="true" class="v-icon notranslate mdi mdi-google-play theme--dark" ></i> </span></button>',
                test_cases: '{"visible":[{"I":"\\"Hello\\"","O":"\\"Hello\\""},{"I":"\\"World\\"","O":"\\"World\\""},{"I":"0","O":"0"},{"I":"\\"Ready?\\"","O":"\\"Ready?\\""},{"I":"1","O":"1"}],"hidden":[{"I":"-1","O":"-1"},{"I":"\\"\\"","O":"\\"\\""},{"I":"\\"1000\\"","O":"\\"1000\\""},{"I":"[1, 2, 3, 4]","O":"[1, 2, 3, 4]"},{"I":"[\\"StrArr\\"]","O":"[\\"StrArr\\"]"}]}',
              },
              {
                id: 2,
                name: 'PlusOne',
                description: 'Increment Me',
                keys: '["++","--", "*", "/", "[", "]"]',
                hints: '<span class="grey--text">Hint: &nbsp;</span><span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="width: 60px; position: unset;"> <span class="hg-button hg-standardBtn atom-2" style="display: flex" > <span>input</span> </span></span><span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default mx-5" style="width: 40px; position: unset;"> <span class="hg-button hg-standardBtn operator" style="display: flex" > <span>+</span> </span></span><span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="width: 40px; position: unset;"> <span class="hg-button hg-standardBtn number" style="display: flex" > <span>3</span> </span></span>',
                test_cases: '{"visible":[{"I":"1","O":"2"},{"I":"10","O":"11"},{"I":"\\"The\\"","O":"\\"The1\\""},{"I":"21","O":"22"},{"I":"\\"Number\\"","O":"\\"Number1\\""}],"hidden":[{"I":"0","O":"1"},{"I":"-5","O":"-4"},{"I":"1000","O":"1001"},{"I":"\\"\\"","O":"\\"1\\""},{"I":"\\"1\\"","O":"\\"11\\""}]}',
              },
              {
                id: 3,
                name: 'Mod',
                description: 'What remains?',
                keys: '["mod", "if", "else", "<"]',
                hints: '<span class="grey--text mr-12">Hint:</span><span class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-atom">input</span><span class="cm-bracket">[<span class="cm-number">0</span><span class="cm-bracket">]</span></span> has dividend</pre> <pre class="CodeMirror-line"><span><span class="cm-atom">input</span><span class="cm-bracket">[<span class="cm-number">1</span><span class="cm-bracket">]</span> has divisor</pre> </span>',
                test_cases: '{"visible":[{"I":"[17, 7]","O":"3"},{"I":"[23, 2]","O":"1"},{"I":"[59, 5]","O":"4"},{"I":"[100, 3]","O":"1"},{"I":"[34, 18]","O":"16"}],"hidden":[{"I":"[25, 5]","O":"0"},{"I":"[3, 1]","O":"0"},{"I":"[10, 10]","O":"0"},{"I":"[100000, 27]","O":"19"},{"I":"[55555555, 299]","O":"159"}]}',
              },              
              {
                id: 4,
                name: 'Abs',
                description: 'Return non-negative',
                keys: '["abs", "while", "var_a", "var_b", "="]',
                hints: '<span class="grey--text mr-12">Hint:</span><div class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-keyword">if</span> <span class="cm-atom">input</span> <span class="cm-operator">&gt;</span> <span class="cm-number">0</span> {</span></pre> <pre class="CodeMirror-line"><span> <span class="cm-keyword">return</span> <span class="cm-operator">-</span> <span class="cm-atom">input</span><span class="cm-operator">;</span></pre> <pre class="CodeMirror-line"><span>}</span></pre> <pre class="CodeMirror-line"><span class="cm-keyword">else</span> {</span></pre> <pre class="CodeMirror-line"><span> <span class="cm-keyword">return</span> <span class="cm-atom">input</span><span class="cm-operator">;</span></pre> <pre class="CodeMirror-line"><span>}</span></pre></div>',
                test_cases: '{"visible":[{"I":"10","O":"10"},{"I":"-5","O":"5"},{"I":"3","O":"3"},{"I":"-25","O":"25"},{"I":"-12","O":"12"}],"hidden":[{"I":"0","O":"0"},{"I":"-99","O":"99"},{"I":"52","O":"52"},{"I":"-252","O":"252"},{"I":"1","O":"1"}]}',
              },
              {
                id: 5,
                name: 'Power',
                description: 'x raised to y',
                keys: '["pow", "true", "false", "==", "||"]',
                hints: '<span class="grey--text mr-12">Hint:</span><span class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-atom">input</span><span class="cm-bracket">[<span class="cm-number">0</span><span class="cm-bracket">]</span> has base</pre> <pre class="CodeMirror-line"><span class="cm-atom">input</span><span class="cm-bracket">[<span class="cm-number">1</span><span class="cm-bracket">]</span> has exponent</pre> </span>',
                test_cases: '{"visible":[{"I":"[2, 3]","O":"8"},{"I":"[5, 2]","O":"25"},{"I":"[4, 2]","O":"16"},{"I":"[3, 4]","O":"81"},{"I":"[9, 3]","O":"729"}],"hidden":[{"I":"[2, 1]","O":"2"},{"I":"[-1, 2]","O":"1"},{"I":"[5, 0]","O":"1"},{"I":"[5, 14]","O":"6103515625"},{"I":"[9, -4]","O":"0"}]}',
              },
              {
                id: 6,
                name: 'Prime',
                description: 'Divisible only by itself and 1',              
                keys: '["foreach", "in"]',
                hints: '["\\"mod(x, y)\\" will return the remainder when dividing x with y","1 is not a prime number!"]',
                test_cases: '{"visible":[{"I":"3","O":"true"},{"I":"7","O":"true"},{"I":"9","O":"false"},{"I":"11","O":"true"},{"I":"4","O":"false"}],"hidden":[{"I":"1","O":"false"},{"I":"2","O":"true"},{"I":"0","O":"false"},{"I":"112501","O":"true"},{"I":"39769","O":"true"}]}',
              },
            ]
          },
          {
            id: 2,
            name: 'Trained',
            puzzles: [              
              {
                id: 7,
                name: 'Length',
                description: 'How many?',
                keys: '["length", "."]',
                hints: '<span class="grey--text mr-12">Hint:</span><div class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-keyword">foreach</span> <span class="cm-variable">var_a</span> <span class="cm-keyword">in</span> <span class="cm-atom">input</span> {</span></pre> <pre class="CodeMirror-line"><span> <span class="cm-variable">var_b</span><span class="cm-operator">--</span><span class="cm-operator">;</span></pre> <pre class="CodeMirror-line"><span>}</span></pre> <pre class="CodeMirror-line"><span class="cm-variable">var_b</span><span class="cm-operator">;</span></pre></div>',
                test_cases:'{"visible":[{"I":"[2, 5, 3, 10]","O":"4"},{"I":"[5, 1, 3]","O":"3"},{"I":"[2, 2, 2, 2]","O":"4"},{"I":"[\\"count\\", \\"me\\"]","O":"2"},{"I":"[10, 100, 1000]","O":"3"}],"hidden":[{"I":"[]","O":"0"},{"I":"[-1, -2, -8]","O":"3"},{"I":"[\\"alone\\"]","O":"1"},{"I":"[1]","O":"1"},{"I":"[1, 2, 3, 4, 5, 6]","O":"6"}]}',
              },
              {
                id: 8,
                name: 'Pop',
                description: 'Who\'s last?',
                keys: '["pop", "!=", "!"]',
                hints: '<span class="grey--text mr-12">Hint:</span><div class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-atom">input</span><span class="cm-bracket">[</span><span class="cm-atom">input</span><span class="cm-operator">.</span><span class="cm-variable-2">length</span> <span class="cm-operator">-</span> <span class="cm-number">3</span><span class="cm-bracket">]</span><span class="cm-operator">;</span></pre></div>',
                test_cases: '{"visible":[{"I":"[1, 2, 3, 4]","O":"4"},{"I":"[22, 1]","O":"1"},{"I":"[\\"a\\", \\"b\\", \\"c\\"]","O":"\\"c\\""},{"I":"[12, 7, 5]","O":"5"},{"I":"[\\"t\\", \\"o\\", \\"p\\"]","O":"\\"p\\""}],"hidden":[{"I":"[1]","O":"1"},{"I":"[0, 0, 0, 0]","O":"0"},{"I":"[\\" \\"]","O":"\\" \\""},{"I":"[\\"me\\"]","O":"\\"me\\""},{"I":"[-1, 12, -22, -9]","O":"-9"}]}',
              },
              {
                id: 9,
                name: 'RadaR',
                description: 'Never odd or eveN',
                keys: '["push", ">"]',
                hints: '<span class="grey--text mr-12">Hint:</span><div class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-keyword">if</span> <span class="cm-variable">var_a</span> <span class="cm-operator">!=</span> <span class="cm-variable">var_b</span><span class="cm-operator">.</span><span class="cm-variable-2">pop</span></pre> <pre class="CodeMirror-line"> <span class="cm-keyword">return</span> <span class="cm-atom">false</span><span class="cm-operator">;</span></pre></div>',
                test_cases: '{"visible":[{"I":"[\\"r\\",\\"a\\",\\"d\\",\\"a\\",\\"r\\"]","O":"true"},{"I":"[\\"c\\",\\"o\\",\\"d\\",\\"e\\"]","O":"false"},{"I":"[\\"c\\",\\"i\\",\\"v\\",\\"i\\",\\"c\\"]","O":"true"},{"I":"[\\"l\\",\\"e\\",\\"v\\",\\"e\\",\\"l\\"]","O":"true"},{"I":"[\\"s\\",\\"a\\",\\"d\\"]","O":"false"}],"hidden":[{"I":"[\\"a\\"]","O":"true"},{"I":"[\\"n\\",\\"o\\",\\"o\\",\\"n\\"]","O":"true"},{"I":"[\\"word\\",\\"n\\",\\"word\\"]","O":"true"},{"I":"[\\"t\\",\\"i\\",\\"t\\",\\"f\\",\\"o\\",\\"r\\",\\"t\\",\\"a\\",\\"t\\"]","O":"false"},{"I":"[\\"a\\",\\"b\\",\\"a\\",\\"b\\"]","O":"false"}]}',
              },
              {
                id: 10,
                name: 'Max',
                description: 'Who\'s the greatest?',
                keys: '["max","var_c"]',
                hints: '<span class="grey--text mr-6">Hint:</span><span class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-atom">input</span><span class="cm-bracket">[<span class="cm-number">0</span><span class="cm-bracket">]</span></span></pre> <span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="position: unset;"> <span class="hg-button hg-standardBtn keyword mt-2" style="display: flex;width: 70x;"> <span>foreach</span> </span></span><span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="position: unset;"> <span class="hg-button hg-standardBtn keyword mt-2 ml-4" style="display: flex;width: 40px;"> <span>if</span> </span></span><pre class="CodeMirror-line mt-2 text-center"><span class="cm-operator">&lt;</span></pre></span>',
                test_cases: '{"visible":[{"I":"[11, 2, 13, 9]","O":"13"},{"I":"[19, 20]","O":"20"},{"I":"[1, 2, 3, 4]","O":"4"},{"I":"[10, 9, 8]","O":"10"},{"I":"[1, 100, 22]","O":"100"}],"hidden":[{"I":"[-5, -2, -1]","O":"-1"},{"I":"[1]","O":"1"},{"I":"[2, 2, 2, 2]","O":"2"},{"I":"[-99, 2]","O":"2"},{"I":"[0, -5, 0, -7]","O":"0"}]}',
              },              
              {
                id: 11,
                name: 'Cubes',
                description: 'Two till input',
                keys: '["min"]',
                hints: '["Cube from 2 till a number whose cube is less than input"]',
                test_cases: '{"visible":[{"I":"632","O":"[8, 27, 64, 125, 216, 343, 512]"},{"I":"99","O":"[8, 27, 64]"},{"I":"189","O":"[8, 27, 64, 125]"},{"I":"50","O":"[8, 27]"},{"I":"400","O":"[8, 27, 64, 125, 216, 343]"}],"hidden":[{"I":"8","O":"[8]"},{"I":"4","O":"[]"},{"I":"-1","O":"[]"},{"I":"125","O":"[8, 27, 64, 125]"},{"I":"1000","O":"[8, 27, 64, 125, 216, 343, 512, 729, 1000]"}]}',
              },
              {
                id: 12,
                name: '01011000',
                description: 'Only 10 types of people: those who understand binary, and those who don’t”.',
                keys: '["var_d"]',
                hints: '["The input is binary, the output is decimal.","Use \\"pow(2, length - index)\\"","Remember that the list\'s index starts from 0"]',
                test_cases: '{"visible":[{"I":"[1, 0, 1]","O":"5"},{"I":"[1, 0]","O":"2"},{"I":"[1, 1, 1]","O":"7"},{"I":"[1, 0, 0]","O":"4"},{"I":"[1, 0, 0, 0]","O":"8"}],"hidden":[{"I":"[0]","O":"0"},{"I":"[0, 0, 0, 0, 0, 1]","O":"1"},{"I":"[1]","O":"1"},{"I":"[0, 0, 1, 0, 1]","O":"5"},{"I":"[1, 1, 1, 1, 1, 1]","O":"63"}]}',
              },
            ]
          },
          {
            id: 3,
            name: 'Competent',
            puzzles: [                 
              {
                id: 13,
                name: 'Order',
                description: 'Do letters oscillate?',
                keys: '["&&"]',
                hints: '["The letters should be in an increasing alphabetical order","Compare one letter to the next one, return false if it\'s not increasing"]',
                test_cases: '{"visible":[{"I":"\\"bca\\"","O":"false"},{"I":"\\"cdb\\"","O":"false"},{"I":"\\"hij\\"","O":"true"},{"I":"\\"mno\\"","O":"true"},{"I":"\\"zyx\\"","O":"false"}],"hidden":[{"I":"\\"z\\"","O":"true"},{"I":"\\"ababc\\"","O":"false"},{"I":"\\"zzz\\"","O":"true"},{"I":"\\"abdeha\\"","O":"false"},{"I":"\\"yya\\"","O":"false"}]}',
              },                         
              {
                id: 14,
                name: 'Merge',
                description: 'Criss-cross the two lists',
                keys: '["insert"]',
                hints: '["Loop and Push from input[0] and push from [1]","Are you making any assumptions about the lists?"]',
                test_cases: '{"visible":[{"I":"[\\"ji\\", \\"on\\"]","O":"[\\"j\\",\\"o\\",\\"i\\",\\"n\\"]"},{"I":"[\\"gu\\", \\"le\\"]","O":"[\\"g\\",\\"l\\",\\"u\\",\\"e\\"]"},{"I":"[\\"cd\\", \\"oe\\"]","O":"[\\"c\\",\\"o\\",\\"d\\",\\"e\\"]"},{"I":"[\\"at\\", \\"uo\\"]","O":"[\\"a\\",\\"u\\",\\"t\\",\\"o\\"]"},{"I":"[\\"sm\\", \\"ae\\"]","O":"[\\"s\\",\\"a\\",\\"m\\",\\"e\\"]"}],"hidden":[{"I":"[\\"ab\\", \\"c\\"]","O":"[\\"a\\",\\"c\\",\\"b\\"]"},{"I":"[\\"a\\", \\" \\"]","O":"[\\"a\\",\\" \\"]"},{"I":"[\\"cd\\", \\"oe\\"]","O":"[\\"c\\",\\"o\\",\\"d\\",\\"e\\"]"},{"I":"[\\"a\\", \\"abcdefg\\"]","O":"[\\"a\\",\\"a\\",\\"b\\",\\"c\\",\\"d\\",\\"e\\",\\"f\\",\\"g\\"]"},{"I":"[\\"numbers\\", [1, 2, 3, 4, 5]]","O":"[\\"n\\", 1, \\"u\\", 2, \\"m\\", 3, \\"b\\", 4, \\"e\\", 5, \\"r\\", \\"s\\"]"}]}',
              },
              {
                id: 15,
                name: 'Sort',
                description: 'Bring some order',
                keys: '["sort"]',
                hints: '<span class="grey--text mr-4">Hint:</span><span class="simple-keyboard hg-theme-default hg-layout-default custom hg-layout-default" style="position: unset; background: unset; width: 80%"> <span class="hg-button hg-standardBtn keyword mt-2" style="display: flex; width: 70px;" > <span>while</span> </span> <span class="hg-button hg-standardBtn keyword mt-2 ml-6" style="display: flex; width: 70px;" > <span>while</span> </span> <div class="CodeMirror-code cm-s-custom mt-2 ml-12" style="background: unset"> <pre class="CodeMirror-line"><span><span class="cm-keyword">if</span> <span class="cm-atom">input</span><span class="cm-bracket">[</span><span class="cm-variable">var_a</span><span class="cm-bracket">]</span> <span class="cm-operator">&gt;</span> <span class="cm-bracket">[</span><span class="cm-variable">var_b</span><span class="cm-bracket">]</span> </span></pre></div></span>',
                test_cases: '{"visible":[{"I":"[5, 3, 1, 9]","O":"[1, 3, 5, 9]"},{"I":"[3, 2, 1]","O":"[1, 2, 3]"},{"I":"[55, 3]","O":"[3, 55]"},{"I":"[3, 3, 1]","O":"[1, 3, 3]"},{"I":"[10, 10, 9, 9]","O":"[9, 9, 10, 10]"}],"hidden":[{"I":"[1]","O":"[1]"},{"I":"[-100, -1, -4, -9]","O":"[-100, -9, -4, -1]"},{"I":"[0, 0, 0]","O":"[0, 0, 0]"},{"I":"[\\"a\\",\\"z\\",\\"d\\",\\"c\\"]","O":"[\\"a\\",\\"c\\",\\"d\\",\\"z\\"]"},{"I":"[0, -99, 1]","O":"[-99, 0, 1]"}]}',
              },
              {
                id: 16,
                name: 'Enigma',
                description: 'nag A ram',
                keys: '["\\""]',
                hints: '["Is every item in the list an anagram of the rest?","You can sort them and compare them to each other"]',
                test_cases: '{"visible":[{"I":"[[\\"e\\",\\"a\\",\\"t\\"],[\\"t\\",\\"e\\",\\"a\\"]]","O":"true"},{"I":"[[\\"n\\",\\"o\\"],[\\"m\\",\\"a\\",\\"t\\",\\"c\\",\\"h\\"]]","O":"false"},{"I":"[[\\"a\\",\\"c\\",\\"t\\"],[\\"c\\",\\"a\\",\\"t\\"]]","O":"true"},{"I":"[[\\"b\\",\\"r\\",\\"a\\",\\"g\\"],[\\"g\\",\\"r\\",\\"a\\",\\"b\\"]]","O":"true"},{"I":"[[\\"d\\",\\"e\\",\\"v\\"],[\\"c\\",\\"h\\",\\"e\\",\\"c\\",\\"k\\"]]","O":"false"}],"hidden":[{"I":"[[\\"alone\\"]]","O":"true"},{"I":"[[\\"e\\",\\"a\\",\\"t\\"],[\\"t\\",\\"e\\",\\"a\\"],[\\"a\\",\\"t\\",\\"e\\"]]","O":"true"},{"I":"[[\\"p\\",\\"a\\",\\"i\\",\\"r\\"],[\\"a\\",\\"i\\",\\"r\\",\\"p\\"],[\\"i\\",\\"r\\",\\"p\\",\\"a\\"],[\\"r\\",\\"i\\",\\"a\\",\\"p\\"]]","O":"true"},{"I":"[[\\"c\\",\\"a\\",\\"t\\"],[\\"c\\",\\"a\\"]]","O":"false"},{"I":"[[\\"c\\",\\"a\\",\\"t\\"],[]]","O":"false"}]}',
              },
              {
                id: 17,
                name: 'Erase',
                description: 'Eliminate the letter',
                keys: '["remove"]',
                hints: '["Remove input[0] while looping through input[1]"]',
                test_cases: '{"visible":[{"I":"[\\"i\\", \\"coide\\"]","O":"\\"code\\""},{"I":"[\\"w\\", \\"erawsed\\"]","O":"\\"erased\\""},{"I":"[\\"z\\", \\"czlean\\"]","O":"\\"clean\\""},{"I":"[\\"x\\", \\"pxlatform\\"]","O":"\\"platform\\""}],"hidden":[{"I":"[\\".\\", \\"test.\\"]","O":"\\"test\\""},{"I":"[\\"t\\", \\"letter\\"]","O":"\\"leer\\""},{"I":"[\\"f\\", \\"nothing\\"]","O":"\\"nothing\\""},{"I":"[\\"u\\", \\"u\\"]","O":"\\"\\""},{"I":"[\\"h\\", \\"hhh\\"]","O":"\\"\\""}]}',
              },
              {
                id: 18,
                name: 'Uniques',
                description: 'Don\'t repeat anything',
                keys: '["function", "f1", ":"]',
                hints: '["Keep only distinct elements by using input.remove(x) to eliminate duplicates"]',
                test_cases: '{"visible":[{"I":"[\\"be\\",\\"unique\\",\\"unique\\"]","O":"[\\"be\\",\\"unique\\"]"},{"I":"[\\"redundancy\\",\\"is\\",\\"costly\\",\\"is\\"]","O":"[\\"redundancy\\",\\"is\\",\\"costly\\"]"},{"I":"[1, 2, 3, 1]","O":"[1, 2, 3]"},{"I":"[\\"failed\\",\\"echo\\",\\"echo\\",\\"echo\\"]","O":"[\\"failed\\",\\"echo\\"]"},{"I":"[\\"can\'t\\",\\"delete\\",\\"them\\",\\"all\\",\\"all\\",\\"all\\"]","O":"[\\"can\'t\\",\\"delete\\",\\"them\\",\\"all\\"]"}],"hidden":[{"I":"[\\"test\\", \\"test\\", \\"test\\", \\"test\\"]","O":"[\\"test\\"]"},{"I":"[\\"the\\", \\"only\\", 1, 1]","O":"[\\"the\\", \\"only\\", 1]"},{"I":"[\\"alone\\"]","O":"[\\"alone\\"]"},{"I":"[3, 2, 1]","O":"[3, 2, 1]"},{"I":"[]","O":"[]"}]}',
              },
            ]
          },
          {
            id: 4,
            name: 'Experienced',
            puzzles: [                 
              {
                id: 19,
                name: '[0, 0]',
                description: 'Nearest to home',
                keys: '["var_e"]',
                hints: '<div class="grey--text mr-4">Hint:</div><div class="CodeMirror-code cm-s-custom" style="background: unset"> <pre class="CodeMirror-line"><span class="cm-keyword">function</span> <span class="cm-variable-2">f1</span> <span class="cm-operator">:</span> <span class="cm-variable">var_a</span> <span class="cm-operator">,</span> <span class="cm-variable">var_b</span> {</pre> <pre class="CodeMirror-line"> <span class="cm-comment">maybe return Manhattan distance</span></pre> <pre class="CodeMirror-line"> <span class="cm-keyword">return</span> <span class="cm-variable">var_a</span> <span class="cm-operator">*</span> <span class="cm-variable">var_b</span><span class="cm-operator">;</span></pre> <pre class="CodeMirror-line">}</pre> <pre class="CodeMirror-line"><span class="cm-variable">var_a</span> <span class="cm-operator">=</span> <span class="cm-variable-2">f1</span><span class="cm-bracket">(</span><span class="cm-atom">input</span><span class="cm-bracket">[</span><span class="cm-number">0</span><span class="cm-bracket">]</span><span class="cm-operator">,</span> <span class="cm-atom">input</span><span class="cm-bracket">[</span><span class="cm-number">1</span><span class="cm-bracket">])</span><span class="cm-operator">;</span></pre></div>',
                test_cases: '{"visible":[{"I":"[[5, 2], [7, 2]]","O":"[5, 2]"},{"I":"[[2, 8], [2, 9]]","O":"[2, 8]"},{"I":"[[1, 1], [4, 4]]","O":"[1, 1]"},{"I":"[[1, 0], [9, 5]]","O":"[1, 0]"},{"I":"[[5, 9], [2, 2]]","O":"[2, 2]"}],"hidden":[{"I":"[[1, 0], [0, 0], [0, 1]]","O":"[0, 0]"},{"I":"[[0, 0]]","O":"[0, 0]"},{"I":"[[2, 5], [3, 4], [5, 5], [1, 2], [2, 1]]","O":"[1, 2]"},{"I":"[[4, 1], [4, 1], [4, 1], [4, 1]]","O":"[4, 1]"},{"I":"[[0, -1], [0, 0], [1, 0]]","O":"[0, 0]"}]}',
              },                         
              {
                id: 20,
                name: 'Split',
                description: 'Break up the words',
                keys: '["var_f", "var_g"]',
                hints: '["Loop through and append in a blank string till you find \\"-\\""]',
                test_cases: '{"visible":[{"I":"\\"group-up\\"","O":"[\\"group\\", \\"up\\"]"},{"I":"\\"watch-out\\"","O":"[\\"watch\\", \\"out\\"]"},{"I":"\\"divide-and-rule\\"","O":"[\\"divide\\", \\"and\\", \\"rule\\"]"},{"I":"\\"merge-\'em\\"","O":"[\\"merge\\", \\"\'em\\"]"},{"I":"\\"join-me!\\"","O":"[\\"join\\", \\"me!\\"]"}],"hidden":[{"I":"\\"f\\"","O":"[\\"f\\"]"},{"I":"\\"unity\\"","O":"[\\"unity\\"]"},{"I":"\\"s-i-n-g-l-e\\"","O":"[\\"s\\", \\"i\\", \\"n\\", \\"g\\", \\"l\\", \\"e\\"]"},{"I":"\\"blank- -matters\\"","O":"[\\"blank\\", \\" \\", \\"matters\\"]"},{"I":"\\"three-of-them\\"","O":"[\\"three\\", \\"of\\", \\"them\\"]"}]}',
              },
              {
                id: 21,
                name: 'Overlap',
                description: 'Don\'t mix things up',
                keys: '["new_list"]',
                hints: '["Imagine two number lines for the two input ranges","Don\'t let the number lines overlap"]',
                test_cases: '{"visible":[{"I":"[[4, 8], [3, 7]]","O":"true"},{"I":"[[6, 9], [4, 8]]","O":"true"},{"I":"[[1, 2], [4, 5]]","O":"false"},{"I":"[[20, 10], [13, 17]]","O":"true"},{"I":"[[3, 5], [7, 9]]","O":"false"}],"hidden":[{"I":"[[0, 0], [1, 1]]","O":"false"},{"I":"[[-1, 5], [1, 2]]","O":"true"},{"I":"[[22, 1], [4, 5]]","O":"true"},{"I":"[[34, 20], [12, 34]]","O":"true"},{"I":"[[2, 20], [21, 34]]","O":"false"}]}',
              },
              {
                id: 22,
                name: 'Match',
                description: 'Find a balance',
                keys: '["f2", "f3"]',
                hints: '["Same number of \\"[\\" and \\"]\\"?","Can\'t close a bracket unless you open it first"]',
                test_cases: '{"visible":[{"I":"[\\"[\\",\\"[\\",\\"]\\",\\"[\\",\\"]\\",\\"]\\"]","O":"true"},{"I":"[\\"[\\",\\"[\\",\\"]\\",\\"]\\"]","O":"true"},{"I":"[\\"[\\",\\"[\\",\\"]\\"]","O":"false"},{"I":"[\\"[\\",\\"]\\",\\"]\\",\\"]\\"]","O":"false"},{"I":"[\\"[\\",\\"]\\",\\"[\\",\\"[\\",\\"]\\",\\"]\\"]","O":"true"}],"hidden":[{"I":"[\\"]\\",\\"]\\",\\"[\\",\\"[\\"]","O":"false"},{"I":"[\\"]\\",\\"[\\"]","O":"false"},{"I":"[\\"[\\",\\"[\\",\\"]\\",\\"]\\",\\"[\\",\\"]\\",\\"[\\",\\"]\\"]","O":"true"},{"I":"[\\"[\\", \\"]\\"]","O":"true"},{"I":"[\\"[\\"]","O":"false"}]}',
              },
              {
                id: 23,
                name: 'Smaller',
                description: 'I\'m greater than?',
                keys: '["var_h", "var_i"]',
                hints: '["How many numbers to the right of me are smaller?"]',
                test_cases: '{"visible":[{"I":"[5, 2, 6, 1]","O":"[2, 1, 1, 0]"},{"I":"[3, 10, 5, 1]","O":"[1, 2, 1, 0]"},{"I":"[5, 2, 3, 4]","O":"[3, 0, 0, 0]"},{"I":"[4, 1000, 10, 2]","O":"[1, 2, 1, 0]"},{"I":"[66, 1, 1, 100]","O":"[2, 0, 0, 0]"}],"hidden":[{"I":"[0]","O":"[0]"},{"I":"[50, 50, 50, 50, 50]","O":"[0, 0, 0, 0, 0]"},{"I":"[-1, -2, -3, -4, -5]","O":"[4, 3, 2, 1, 0]"},{"I":"[0, 1, 2, 3, 4, 5]","O":"[0, 0, 0, 0, 0, 0]"},{"I":"[]","O":"[]"}]}',
              },
              {
                id: 24,
                name: 'Alone',
                description: 'Who\'s lonely?',
                keys: '["fill"]',
                hints: '["Return the smallest number whose frequency is 1","If no element occurs once, return -1"]',
                test_cases: '{"visible":[{"I":"[2, 0, 1, 2, 0, 2]","O":"1"},{"I":"[2, 2, 3, 6]","O":"3"},{"I":"[0, 0, 5]","O":"5"},{"I":"[5, 4, 7]","O":"4"},{"I":"[8, 8, 8, 3, 3]","O":"-1"}],"hidden":[{"I":"[10, 10, 10, 10, 10, 10]","O":"-1"},{"I":"[4, 4, 4, 3, 3, 2, 10, 9]","O":"2"},{"I":"[4, 3, 2, 1]","O":"1"},{"I":"[10]","O":"10"},{"I":"[]","O":"-1"}]}',
              },
            ]
          },
          {
            id: 5,
            name: 'Proficient',
            puzzles: [                 
              {
                id: 25,
                name: 'Undo',
                description: 'Everyone makes mistakes',
                keys: '["f4", "f5"]',
                hints: '["\\"<\\" signifies backspace operation","Compare the strings at the end of typing","If the string is blank, \\"<\\" does nothing"]',
                test_cases: '{"visible":[{"I":"[\\"code<r<\\", \\"code<\\"]","O":"true"},{"I":"[\\"v<irus\\", \\"irus\\"]","O":"true"},{"I":"[\\"s<o<ftware\\", \\"soft<war<e\\"]","O":"false"},{"I":"[\\"p<h<oto\\", \\"phot<o\\"]","O":"false"},{"I":"[\\"deve<\\", \\"dev\\"]","O":"true"}],"hidden":[{"I":"[\\"so<ftwa<<re<<\\", \\"so<ft\\", \\"so<ftware<<<<\\", \\"sft\\", \\"sftware<<<<\\"]","O":"true"},{"I":"[\\"application<<<<<<<\\", \\"appli<c<a<t<i<o<n<\\"]","O":"true"},{"I":"[\\"<<no effect\\", \\"no effect\\"]","O":"true"},{"I":"[\\"whole<<<<<<\\", \\"hole<<<<<\\"]","O":"true"},{"I":"[\\"<<<<<<<<<\\", \\"\\"]","O":"true"}]}',
              },                         
              {
                id: 26,
                name: 'Add',
                description: 'Sum it up',
                keys: '["map", "->"]',
                hints: '["Use custom function with a loop","*, / and mod(x, 10) to get digits"]',
                test_cases: '{"visible":[{"I":"[[1, 1], [2, 2]]","O":"[3, 3]"},{"I":"[[7, 1], [2, 5]]","O":"[9, 6]"},{"I":"[[2], [3]]","O":"[5]"},{"I":"[[1, 1], [2, 2]]","O":"[3, 3]"},{"I":"[[5, 1], [1, 3]]","O":"[6, 4]"}],"hidden":[{"I":"[[3, 1], [9, 9], [1, 0], [0, 0], [5, 2]]","O":"[1, 9, 2]"},{"I":"[[0, 1], [9]]","O":"[1, 0]"},{"I":"[[1, 4, 5], [1], [1, 2, 3], [2, 2, 9, 9], [0], [-5]]","O":"[2, 5, 6, 3]"},{"I":"[[9, 9], [1]]","O":"[1, 0, 0]"},{"I":"[[-2], [1, 0]]","O":"[8]"}]}',
              },
              {
                id: 27,
                name: 'Dummy',
                description: 'Find the dummy',
                keys: '["f6", "f7"]',
                hints: '["return the index of \\"dummy\\" in the input","return -1 if not found"]',
                test_cases: '{"visible":[{"I":"\\"spotdummy\\"","O":"4"},{"I":"\\"empty\\"","O":"-1"},{"I":"\\"hidummy\\"","O":"2"},{"I":"\\"xedummyne\\"","O":"2"},{"I":"\\"whereisdumm\\"","O":"-1"}],"hidden":[{"I":"\\"dummydummy\\"","O":"0"},{"I":"\\"dummy\\"","O":"0"},{"I":"\\"dumdummytest\\"","O":"3"},{"I":"\\"ymmud\\"","O":"-1"},{"I":"\\"dummfo\\"","O":"-1"},{"I":"\\"dummyyy\\"","O":"0"}]}',
              },
              {
                id: 28,
                name: 'Compress',
                description: 'Squeeze me',
                keys: '["var_j", "var_k"]',
                hints: '["Run-length Encoding","Add the frequency next to the string"]',
                test_cases: '{"visible":[{"I":"[\\"a\\", \\"a\\", \\"b\\", \\"b\\", \\"b\\"]","O":"\\"a2b3\\""},{"I":"[\\"a\\", \\"ab\\", \\"b\\", \\"b\\", \\"b\\", \\"a\\"]","O":"\\"aabb3a\\""},{"I":"[1, 1, 2]","O":"\\"122\\""},{"I":"[\\"a\\", \\"b\\"]","O":"\\"ab\\""},{"I":"[1, 1, 2, 2, 3]","O":"\\"12223\\""}],"hidden":[{"I":"[\\"single\\"]","O":"\\"single\\""},{"I":"[\\"mix\\", \\"ture\\"]","O":"\\"mixture\\""},{"I":"[\\"m\\", \\"a\\", \\"n\\", \\"y\\"]","O":"\\"many\\""},{"I":"[\\"\\"]","O":"\\"\\""},{"I":"[\\"a\\", \\"a\\", \\"a\\", \\"a\\"]","O":"\\"a4\\""}]}',
              },
              {
                id: 29,
                name: 'Camel',
                description: 'Find the pattern in queries',
                keys: '["sort_with"]',
                hints: '["Loop through queries and search for the pattern in input[0]","Additional small letters can be padded around the pattern and can be discarded while iterating","Think about the ASCII table & the available keys for finding capital letters"]',
                test_cases: '{"visible":[{"I":"[\\"FB\\", [\\"FootBall\\",\\"ForceFeedBack\\"]]","O":"[true, false]"},{"I":"[\\"MF\\", [\\"MyFunc\\",\\"ThisIsMyFunc\\"]]","O":"[true, false]"},{"I":"[\\"CC\\", [\\"CamelCase\\",\\"CarbonCopy\\"]]","O":"[true, true]"},{"I":"[\\"WP\\", [\\"InterCaps\\",\\"WordPerfect\\"]]","O":"[false, true]"},{"I":"[\\"FE\\", [\\"TedEx\\",\\"FedEx\\"]]","O":"[false, true]"}],"hidden":[{"I":"[\\"NC\\", [\\"nocaps\\", \\"NC\\", \\"N\\", \\"C\\"]]","O":"[false, true, false, false]"},{"I":"[\\"TT\\", [\\"\\"]]","O":"[false]"},{"I":"[ \\"AP\\", [\\"AirDrop\\", \\"ActivePearl\\", \\"AppleTalk\\", \\"AppKit\\", \\"AirPod\\", \\"AirPlay\\"]]","O":"[false, true, false, false, true, true]"},{"I":"[\\"\\", [\\"NoPattern\\"]]","O":"[false]"},{"I":"[\\"ZZ\\", [\\"ZepPole\\", \\"ZigZag\\", \\"ZeBroid\\"]]","O":"[false, true, false]"}]}',
              },
              {
                id: 30,
                name: 'MaxProd',
                description: 'Largest Product of contiguous subarray',
                keys: '["f8", "f9", "f10"]',
                hints: '["Return the maximum product that can be obtained from a sequence of numbers in input","[3,0,6] should return 0 instead of 18 since [3,6] is not a contiguous subarray, [3,0] or [0,6] are"]',
                test_cases: '{"visible":[{"I":"[5, 10, 1, -4, 2]","O":"50"},{"I":"[7, -2, -3, 5, -10]","O":"210"},{"I":"[4, 1, -1, 2, 2]","O":"4"},{"I":"[2, 7, -3, 9, 3]","O":"27"},{"I":"[4, 1, 1, -5, 3]","O":"4"}],"hidden":[{"I":"[-4, -3, -2, -1]","O":"24"},{"I":"[2, 3, 4, 5, 10]","O":"1200"},{"I":"[1, 2, -2, -5, 0]","O":"20"},{"I":"[-100, 0, 0, 0, 0, 0]","O":"0"},{"I":"[0, 0, 0, 0, 0]","O":"0"}]}',
              },
            ]
          },
          {
            id: 6,
            name: 'Inspiring',
            puzzles: [                 
              {
                id: 31,
                name: 'Nth',
                description: 'What is the real nth digit?',
                keys: '["is_list"]',
                hints: '["If you write an infinite sequence from 1,2,3,... without commas, what would be the nth digit?<br>Example: ...891011 - 10\'s 1 is the 10th digit. 10\'s 0 is the 11th digit, 11\'s first 1 is the 12th digit and 11\'s second 1 is the 13th digit.","Notice that the output expects quotes. Don\'t read the next hint if you want to think through the solution","# of digits in total: 1-9: 9, 10-99: 90*2, 100-999: 900*3, 1000-9999: 9000*4"]',
                test_cases: '{"visible":[{"I":"10","O":"\\"1\\""},{"I":"5","O":"\\"5\\""},{"I":"20","O":"\\"1\\""},{"I":"27","O":"\\"8\\""},{"I":"9","O":"\\"9\\""}],"hidden":[{"I":"0","O":"\\"0\\""},{"I":"1","O":"\\"1\\""},{"I":"10000","O":"\\"7\\""},{"I":"500","O":"\\"0\\""},{"I":"9999999","O":"\\"8\\""}]}',
              },                         
              {
                id: 32,
                name: 'Tree',
                description: 'Untangle and flatten',
                keys: '["copy"]',
                hints: '["Use .is_list()","Use recursion"]',
                test_cases: '{"visible":[{"I":"[[1], [2]]","O":"[1, 2]"},{"I":"[[1, 2], [3]]","O":"[1, 2, 3]"},{"I":"[[1, [2]]]","O":"[1, 2]"},{"I":"[[1], [2, 7, 5]]","O":"[1, 2, 5, 7]"},{"I":"[[1, [2, 3]]]","O":"[1, 2, 3]"}],"hidden":[{"I":"[3, 2, 1]","O":"[1, 2, 3]"},{"I":"[3, [6, [8, [7]], [5, 4, [1, 2, [10, [9]]]]]]","O":"[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"},{"I":"[-10]","O":"[-10]"},{"I":"[[-1,-3],[-4, [1, [-99, [100, [10, 1]]]], -2],[-5, [0]]]","O":"[-99, -5, -4, -3, -2, -1, 0, 1, 1, 10, 100]"},{"I":"[[[[[[[[[[[[[[0], 1]]]]]]]], 2]]]]]","O":"[0, 1, 2]"}]}',
              },
              {
                id: 33,
                name: 'Shorty',
                description: 'Shortest Unsorted Continuous Subarray',
                keys: '["var_l", "var_m"]',
                hints: '["What is the minimum length of a continuous subarray, that when sorted, will sort the entire input?","Sorting [4, 3] sorts [1, 2, 4, 3, 10], so return 2<br>Sorting [5, 3, 1] sorts [5, 3, 1, 6, 9], so return 3"]',
                test_cases: '{"visible":[{"I":"[1, 2, 4, 3, 10]","O":"2"},{"I":"[1, 2, 6, 10, 8]","O":"2"},{"I":"[5, 3, 1, 6, 9]","O":"3"},{"I":"[4, 6, 9, 8]","O":"2"},{"I":"[2, 1, 3]","O":"2"}],"hidden":[{"I":"[0, 1, 2, 3, 4, 5, 6]","O":"0"},{"I":"[99999]","O":"0"},{"I":"[9, 8, 7, 6, 5, 4, 3, 2, 1]","O":"9"},{"I":"[-9999, -2, -1, -9, 0, 1000]","O":"3"},{"I":"[]","O":"0"}]}',
              },
              {
                id: 34,
                name: 'Paint',
                description: 'A Colorful fence with n posts and k colors',
                keys: '["f11", "f12", "f13"]',
                hints: '["Return the no. of ways to paint a fence with n posts and k colors such that no two adjacent posts have the same color","If n = 2, k = 4: (ways when both posts have the same color: 4) + (ways when both posts have diff. color: 4*(choices for 1st post) * 3(choices for 2nd post) = 12) = 16"]',
                test_cases: '{"visible":[{"I":"[2, 4]","O":"16"},{"I":"[4, 5]","O":"580"},{"I":"[3, 2]","O":"6"},{"I":"[2, 6]","O":"36"},{"I":"[7, 3]","O":"1344"}],"hidden":[{"I":"[10, 1]","O":"0"},{"I":"[0, 5]","O":"0"},{"I":"[1, 1]","O":"1"},{"I":"[0, 0]","O":"0"},{"I":"[5, 5]","O":"2800"}]}',
              },
              {
                id: 35,
                name: 'Golomb',
                description: 'Increasing integer sequence where nth term = no. of times n appears in the sequence',
                keys: '["var_n", "var_o"]',
                hints: '["It is an increasing integer sequence where n-th term is equal to the number of times n appears in the sequence", "nth number = 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5<br>The 1st no. is 1, so 1 appears once<br>The 2nd no. is 2, so 2 appears twice<br>The 3rd no. is 2, so 3 appears twice<br>The 4th no. is 3, so 4 appears thrice<br>The 5th no. is 3, so 5 appears thrice"]',
                test_cases: '{"visible":[{"I":"4","O":"[1, 2, 2, 3]"},{"I":"6","O":"[1, 2, 2, 3, 3, 4]"},{"I":"3","O":"[1, 2, 2]"},{"I":"8","O":"[1, 2, 2, 3, 3, 4, 4, 4]"},{"I":"5","O":"[1, 2, 2, 3, 3]"}],"hidden":[{"I":"0","O":"[]"},{"I":"1","O":"[1]"},{"I":"-1","O":"[]"},{"I":"10","O":"[1, 2, 2, 3, 3, 4, 4, 4, 5, 5]"},{"I":"25","O":"[1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9]"}]}',
              },
              {
                id: 36,
                name: 'Islands',
                description: '2D Map. 1 is land, 0 is water. Count the # of islands',
                keys: '["f14", "f15", "f16"]',
                hints: '["Form a 2d map of 1s (land) and 0s (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. Assume all four edges of the grid are all surrounded by water.","Example:<br>11110<br>11010<br>11000<br>00000<br>Output: 1<br>","Example:<br>11000<br>11000<br>00100<br>00011<br>Output: 3"]',
                test_cases: '{"visible":[{"I":"[[0,0,0,0], [0,1,1,0], [0,0,0,0]]","O":"1"},{"I":"[[0,0,1,1], [0,0,1,1], [0,0,0,0]]","O":"1"},{"I":"[[0,0,0,1], [1,1,0,0], [1,1,0,1]]","O":"3"},{"I":"[[1,0,0,1], [0,0,0,0], [1,0,0,1]]","O":"4"},{"I":"[[1,0,0,0], [1,1,1,1], [0,0,0,1]]","O":"1"}],"hidden":[{"I":"[[0, 0], [0, 0], [0, 0]]","O":"0"},{"I":"[[1], [1], [1], [1], [1]]","O":"1"},{"I":"[[1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1], [1, 0, 0 , 0, 0, 1], [1, 1, 1, 1, 1, 1]]","O":"1"},{"I":"[]","O":"0"},{"I":"[[0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0] ]","O":"12"}]}',
              },
            ]
          },          
          ], { include: [{ model: Puzzle, as: 'puzzles' }] })
            .then((challenges) => {

              const subs = {
                orion: [
                  { sub: 'apple|000226.6f8d499e784849738a7ab0f232174e40.0459' },
                  { sub: 'google-oauth2|105172348390012741813' },
                  { sub: 'auth0|5e8877c4f23bc20bf0cd3a91' },
                  { sub: 'google-oauth2|114136621846243390333' },
                  { sub: 'auth0|5e8878386595110c10c87268' },
                  { sub: 'google-oauth2|105440506928525991072' },
                  { sub: 'google-oauth2|103981635764576096083' },
                  { sub: 'auth0|5e726ea938925a0cb5b378dc' },
                ],
                xene: [
                  { sub: 'auth0|5e367d926cd6270e855f51ff' },
                  { sub: 'google-oauth2|103283342269977706772' },
                  { sub: 'google-oauth2|105172348390012741813' },
                  { sub: 'google-oauth2|111408880675367069270' },
                  { sub: 'google-oauth2|116114970989125658940' },
                  { sub: 'google-oauth2|100774407007587296018' },
                  { sub: 'google-oauth2|101242570553947612655' },
                  { sub: 'google-oauth2|116257644010804031726' },
                ]
              }

              return User.bulkCreate(subs[process.env.PROJECT_ID])
                .then(users => {
                  // return Puzzle.count()
                  //   .then((puzzles_count) => {
                  //     let userPuzzlesObj = []
                  //     for (let i = 0; i < users.length; i++) {
                  //       let no_of_puzzles = getRandomBetween(6, puzzles_count)
                  //       let puzzles_for_user = getUniqueRandoms(no_of_puzzles, puzzles_count)
                  //       for (let j = 0; j < no_of_puzzles; j++) {
                  //         let edits = getRandomBetween(500, 900)
                  //         let time = getRandomBetween(500, 900)
                  //         let conciseness = getRandomBetween(500, 900)
                  //         let complexity = getRandomBetween(500, 900)
                  //         let score = edits + time + conciseness + complexity
                  //         userPuzzlesObj.push({ userSub: users[i].sub, puzzleId: puzzles_for_user[j], code: 'input', edits, time, conciseness, complexity, score })
                  //       }
                  //     }
                  //     return UserPuzzles.bulkCreate(userPuzzlesObj)
                  //   })
                  //   .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        })
    })
  })
    .catch(err => console.log(err))

}

module.exports = {
  syncDB,
  User,
  Challenge,
  Puzzle,
  UserPuzzles,
}