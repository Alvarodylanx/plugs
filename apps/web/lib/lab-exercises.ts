export type Language = 'python' | 'javascript' | 'java' | 'cpp';

export interface LabExercise {
  slug: string;
  title: string;
  language: Language;
  pistonLang: string;
  pistonVersion: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  subject: string;
  points: number;
  description: string;
  starterCode: string;
  hints: string[];
  expectedOutput?: string;
}

export const LANGUAGE_META: Record<Language, { label: string; color: string; bg: string; border: string; monacoLang: string }> = {
  python:     { label: 'Python',     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   monacoLang: 'python'     },
  javascript: { label: 'JavaScript', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', monacoLang: 'javascript' },
  java:       { label: 'Java',       color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', monacoLang: 'java'       },
  cpp:        { label: 'C++',        color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', monacoLang: 'cpp'        },
};

export const LAB_EXERCISES: LabExercise[] = [
  // ── PYTHON: BEGINNER ─────────────────────────────────────────────────────
  {
    slug: 'hello-world',
    title: 'Hello, World!',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Beginner',
    category: 'Basics',
    subject: 'Computer Science',
    points: 10,
    description: `## Hello, World!

Your very first program. Print the message \`Hello, World!\` to the console.

This is the classic starting exercise in every language — it confirms your environment works and introduces the most fundamental operation: output.

**Expected Output:**
\`\`\`
Hello, World!
\`\`\``,
    starterCode: `# Print "Hello, World!" to the console\nprint("Hello, World!")\n`,
    expectedOutput: 'Hello, World!',
    hints: [
      'Use the print() function',
      'Text (strings) must be wrapped in quotes: \'single\' or "double"',
      'Capitalisation matters — match exactly: Hello, World!',
    ],
  },
  {
    slug: 'fizzbuzz',
    title: 'FizzBuzz',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Beginner',
    category: 'Loops',
    subject: 'Computer Science',
    points: 25,
    description: `## FizzBuzz

Print numbers from 1 to 20 following these rules:
- Divisible by **3** → print \`Fizz\`
- Divisible by **5** → print \`Buzz\`
- Divisible by **both 3 and 5** → print \`FizzBuzz\`
- Otherwise → print the number

**Expected Output (first few):**
\`\`\`
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
...
FizzBuzz
\`\`\`

One of the most famous coding interview questions of all time!`,
    starterCode: `for i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)\n`,
    hints: [
      'Use the modulo operator % to check divisibility (e.g. i % 3 == 0)',
      'Check for 15 (divisible by both) FIRST — otherwise "FizzBuzz" never prints',
      'Use if / elif / else structure',
    ],
  },
  {
    slug: 'sum-of-list',
    title: 'Sum of a List',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Beginner',
    category: 'Lists',
    subject: 'Computer Science',
    points: 15,
    description: `## Sum of a List

Given the list below, calculate and print the total sum **without** using Python's built-in \`sum()\` function.

\`\`\`python
numbers = [4, 8, 15, 16, 23, 42]
\`\`\`

**Expected Output:**
\`\`\`
108
\`\`\`

This exercise practises using loops to accumulate a running total.`,
    starterCode: `numbers = [4, 8, 15, 16, 23, 42]\n\ntotal = 0\nfor num in numbers:\n    total += num\n\nprint(total)\n`,
    expectedOutput: '108',
    hints: [
      'Use a for loop to iterate through the list',
      'Keep a running total variable starting at 0',
      'Add each element with total += num',
    ],
  },
  {
    slug: 'reverse-string',
    title: 'Reverse a String',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Beginner',
    category: 'Strings',
    subject: 'Computer Science',
    points: 15,
    description: `## Reverse a String

Reverse the given string and print it.

**Input:** \`"Hello, Plug!"\`

**Expected Output:**
\`\`\`
!gulP ,olleH
\`\`\`

Python strings can be sliced just like lists — a key concept to master!`,
    starterCode: `text = "Hello, Plug!"\n\n# Reverse the string and print it\nprint(text[::-1])\n`,
    expectedOutput: '!gulP ,olleH',
    hints: [
      'Python slice notation: text[start:stop:step]',
      'A step of -1 means "go backwards"',
      'text[::-1] reverses a string in one line',
    ],
  },
  {
    slug: 'count-vowels',
    title: 'Count Vowels',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Beginner',
    category: 'Strings',
    subject: 'Computer Science',
    points: 20,
    description: `## Count Vowels

Count how many vowels (a, e, i, o, u — upper and lower case) appear in the sentence, then print the count.

**Input:** \`"The quick brown fox jumps over the lazy dog"\`

**Expected Output:**
\`\`\`
11
\`\`\``,
    starterCode: `sentence = "The quick brown fox jumps over the lazy dog"\n\ncount = 0\nvowels = "aeiouAEIOU"\n\nfor char in sentence:\n    if char in vowels:\n        count += 1\n\nprint(count)\n`,
    expectedOutput: '11',
    hints: [
      'Loop through each character in the sentence',
      'Check if the character is in the vowels string using "in"',
      'Increment your counter each time you find a vowel',
    ],
  },

  // ── PYTHON: INTERMEDIATE ─────────────────────────────────────────────────
  {
    slug: 'fibonacci',
    title: 'Fibonacci Sequence',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Intermediate',
    category: 'Algorithms',
    subject: 'Mathematics',
    points: 30,
    description: `## Fibonacci Sequence

Print the first **10 Fibonacci numbers**, starting from 0. Each number is the sum of the two before it.

**Expected Output:**
\`\`\`
0
1
1
2
3
5
8
13
21
34
\`\`\`

The Fibonacci sequence appears everywhere in nature — sunflower seeds, spiral shells, and even stock market patterns.`,
    starterCode: `a, b = 0, 1\n\nfor i in range(10):\n    print(a)\n    a, b = b, a + b\n`,
    hints: [
      'Track two variables: current (a) and next (b)',
      'Advance with: a, b = b, a + b',
      'Python\'s tuple unpacking makes this a one-liner',
    ],
  },
  {
    slug: 'palindrome',
    title: 'Palindrome Check',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Intermediate',
    category: 'Strings',
    subject: 'Computer Science',
    points: 30,
    description: `## Palindrome Check

A palindrome reads the same forwards and backwards (e.g. "racecar", "level").

Check each word in the list and print whether it is a palindrome.

**Expected Output:**
\`\`\`
racecar -> palindrome
hello -> not a palindrome
level -> palindrome
world -> not a palindrome
madam -> palindrome
\`\`\``,
    starterCode: `words = ["racecar", "hello", "level", "world", "madam"]\n\nfor word in words:\n    if word == word[::-1]:\n        print(f"{word} -> palindrome")\n    else:\n        print(f"{word} -> not a palindrome")\n`,
    hints: [
      'Compare the word to its reverse: word == word[::-1]',
      'f-strings: f"{word} -> palindrome" formats the output',
    ],
  },
  {
    slug: 'prime-numbers',
    title: 'Prime Numbers',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Intermediate',
    category: 'Mathematics',
    subject: 'Mathematics',
    points: 35,
    description: `## Prime Numbers

Print all prime numbers from 2 to 50 on a single line separated by spaces.

A prime has no factors other than 1 and itself.

**Expected Output:**
\`\`\`
2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
\`\`\``,
    starterCode: `primes = []\n\nfor num in range(2, 51):\n    is_prime = True\n    for divisor in range(2, num):\n        if num % divisor == 0:\n            is_prime = False\n            break\n    if is_prime:\n        primes.append(num)\n\nprint(" ".join(map(str, primes)))\n`,
    expectedOutput: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47',
    hints: [
      'A number is prime if no value between 2 and (n-1) divides it evenly',
      'Use nested loops: outer for candidates, inner for testing divisors',
      'break early when you find a divisor — no need to keep checking',
    ],
  },
  {
    slug: 'factorial',
    title: 'Factorial (Recursion)',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Intermediate',
    category: 'Recursion',
    subject: 'Mathematics',
    points: 35,
    description: `## Factorial with Recursion

n! (n factorial) = n × (n-1) × ... × 2 × 1. By definition, 0! = 1.

Write a **recursive** \`factorial(n)\` function and print factorials from 0 to 7.

**Expected Output:**
\`\`\`
0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720
7! = 5040
\`\`\``,
    starterCode: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nfor i in range(8):\n    print(f"{i}! = {factorial(i)}")\n`,
    hints: [
      'Base case: factorial(0) = 1 and factorial(1) = 1',
      'Recursive case: n * factorial(n-1)',
      'The function calls itself with a smaller input each time',
    ],
  },
  {
    slug: 'bubble-sort',
    title: 'Bubble Sort',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Intermediate',
    category: 'Sorting',
    subject: 'Computer Science',
    points: 40,
    description: `## Bubble Sort

Implement Bubble Sort to sort a list in ascending order by repeatedly swapping adjacent elements that are out of order.

**Input:** \`[64, 34, 25, 12, 22, 11, 90]\`

**Expected Output:**
\`\`\`
Unsorted: [64, 34, 25, 12, 22, 11, 90]
Sorted:   [11, 12, 22, 25, 34, 64, 90]
\`\`\`

**Time complexity:** O(n²) — fundamental to understand even though faster algorithms exist.`,
    starterCode: `numbers = [64, 34, 25, 12, 22, 11, 90]\nprint(f"Unsorted: {numbers}")\n\nn = len(numbers)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if numbers[j] > numbers[j + 1]:\n            numbers[j], numbers[j + 1] = numbers[j + 1], numbers[j]\n\nprint(f"Sorted:   {numbers}")\n`,
    hints: [
      'Compare numbers[j] and numbers[j+1]',
      'Swap if numbers[j] > numbers[j+1]',
      'Python swap: a, b = b, a',
      'After each outer loop pass, the largest unsorted element "bubbles" to its place',
    ],
  },

  // ── PYTHON: ADVANCED ─────────────────────────────────────────────────────
  {
    slug: 'binary-search',
    title: 'Binary Search',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Advanced',
    category: 'Algorithms',
    subject: 'Computer Science',
    points: 50,
    description: `## Binary Search

Binary search finds a target in a **sorted** list in O(log n) time — far faster than linear search.

**How it works:**
1. Look at the middle element
2. Target found? Return index
3. Target < middle? Search left half
4. Target > middle? Search right half
5. Repeat until found or space empty

**Expected Output:**
\`\`\`
Found 23 at index 4
Found 7 at index 2
-1 not found
\`\`\``,
    starterCode: `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif target > arr[mid]:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nsorted_list = [1, 5, 7, 11, 23, 31, 45, 67]\nprint(f"Found 23 at index {binary_search(sorted_list, 23)}")\nprint(f"Found 7 at index {binary_search(sorted_list, 7)}")\nif binary_search(sorted_list, -1) == -1:\n    print("-1 not found")\n`,
    hints: [
      'Maintain left and right pointers on the search range',
      'mid = (left + right) // 2',
      'If arr[mid] == target, return mid',
      'Narrow the range: left = mid+1 (go right) or right = mid-1 (go left)',
    ],
  },
  {
    slug: 'caesar-cipher',
    title: 'Caesar Cipher',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Advanced',
    category: 'Cryptography',
    subject: 'Computer Science',
    points: 60,
    description: `## Caesar Cipher

Julius Caesar used this cipher to protect military messages — shift each letter by a fixed number.

Shift 3: A→D, B→E, Z→C (wraps around).

**Expected Output:**
\`\`\`
Encrypted: KHOOR ZRUOG
Decrypted: HELLO WORLD
\`\`\``,
    starterCode: `def caesar_cipher(text, shift):\n    result = ""\n    for char in text:\n        if char.isalpha():\n            base = ord('A') if char.isupper() else ord('a')\n            result += chr((ord(char) - base + shift) % 26 + base)\n        else:\n            result += char\n    return result\n\noriginal = "HELLO WORLD"\nencrypted = caesar_cipher(original, 3)\ndecrypted = caesar_cipher(encrypted, -3)\nprint(f"Encrypted: {encrypted}")\nprint(f"Decrypted: {decrypted}")\n`,
    hints: [
      'ord() converts a character to its ASCII number',
      'chr() converts an ASCII number back to a character',
      'Modulo 26 handles the wrap-around: Z + 1 → A',
      'Formula: chr((ord(char) - base + shift) % 26 + base)',
    ],
  },
  {
    slug: 'word-frequency',
    title: 'Word Frequency Counter',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Advanced',
    category: 'Data Structures',
    subject: 'Computer Science',
    points: 45,
    description: `## Word Frequency Counter

Count how many times each word appears, then print sorted by frequency (most common first).

**Input:** \`"the cat sat on the mat the cat sat"\`

**Expected Output:**
\`\`\`
the: 3
cat: 2
sat: 2
on: 1
mat: 1
\`\`\``,
    starterCode: `text = "the cat sat on the mat the cat sat"\nwords = text.split()\n\nfreq = {}\nfor word in words:\n    freq[word] = freq.get(word, 0) + 1\n\nfor word, count in sorted(freq.items(), key=lambda x: -x[1]):\n    print(f"{word}: {count}")\n`,
    hints: [
      'Use a dictionary: keys = words, values = counts',
      'dict.get(key, 0) returns 0 if key not found',
      'sorted() with key=lambda x: -x[1] sorts by count descending',
    ],
  },
  {
    slug: 'oop-bank-account',
    title: 'Bank Account (OOP)',
    language: 'python',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    difficulty: 'Advanced',
    category: 'Object-Oriented',
    subject: 'Computer Science',
    points: 55,
    description: `## Bank Account — OOP

Create a \`BankAccount\` class with:
- \`balance\` attribute starting at 0
- \`deposit(amount)\` — add money
- \`withdraw(amount)\` — remove money (print "Insufficient funds" if not enough)
- \`get_balance()\` — return current balance

**Expected Output:**
\`\`\`
Balance: 0
After deposit 500: 500
After deposit 200: 700
After withdraw 150: 550
Insufficient funds
Final balance: 550
\`\`\``,
    starterCode: `class BankAccount:\n    def __init__(self):\n        self.balance = 0\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n        else:\n            print("Insufficient funds")\n\n    def get_balance(self):\n        return self.balance\n\naccount = BankAccount()\nprint(f"Balance: {account.get_balance()}")\naccount.deposit(500)\nprint(f"After deposit 500: {account.get_balance()}")\naccount.deposit(200)\nprint(f"After deposit 200: {account.get_balance()}")\naccount.withdraw(150)\nprint(f"After withdraw 150: {account.get_balance()}")\naccount.withdraw(1000)\nprint(f"Final balance: {account.get_balance()}")\n`,
    hints: [
      'Use self.balance to track the account balance',
      'deposit: self.balance += amount',
      'withdraw: check if amount <= self.balance before subtracting',
    ],
  },

  // ── JAVASCRIPT ───────────────────────────────────────────────────────────
  {
    slug: 'js-arrow-functions',
    title: 'Arrow Functions',
    language: 'javascript',
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    difficulty: 'Beginner',
    category: 'Functions',
    subject: 'Computer Science',
    points: 20,
    description: `## Arrow Functions (JavaScript)

Modern JavaScript uses arrow functions for concise syntax.

\`\`\`js
// Traditional
function square(x) { return x * x; }

// Arrow (equivalent)
const square = (x) => x * x;
\`\`\`

**Expected Output:**
\`\`\`
25
125
Hello, Plug!
\`\`\``,
    starterCode: `const square = (x) => x * x;\nconst cube = (x) => x * x * x;\nconst greet = (name) => \`Hello, \${name}!\`;\n\nconsole.log(square(5));\nconsole.log(cube(5));\nconsole.log(greet("Plug"));\n`,
    hints: [
      'Arrow syntax: (params) => expression',
      'No curly braces needed for single-expression returns',
      'Template literals use backticks ` and ${variable}',
    ],
  },
  {
    slug: 'js-array-methods',
    title: 'Array Methods',
    language: 'javascript',
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    difficulty: 'Intermediate',
    category: 'Arrays',
    subject: 'Computer Science',
    points: 35,
    description: `## Array Methods (JavaScript)

JavaScript arrays have powerful built-in methods:
- \`.filter(fn)\` — keep elements where fn is true
- \`.map(fn)\` — transform each element
- \`.reduce(fn, init)\` — combine all elements

**Expected Output:**
\`\`\`
Even numbers: [ 2, 4, 6, 8, 10 ]
Squares: [ 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 ]
Sum: 55
\`\`\``,
    starterCode: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\nconst evens   = numbers.filter(n => n % 2 === 0);\nconst squares = numbers.map(n => n * n);\nconst sum     = numbers.reduce((acc, n) => acc + n, 0);\n\nconsole.log("Even numbers:", evens);\nconsole.log("Squares:", squares);\nconsole.log("Sum:", sum);\n`,
    hints: [
      'filter returns elements where callback returns true',
      'map transforms each element and returns a new array',
      'reduce starts with initial value (0) and accumulates',
    ],
  },
  {
    slug: 'js-fibonacci',
    title: 'Fibonacci (JavaScript)',
    language: 'javascript',
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    difficulty: 'Intermediate',
    category: 'Algorithms',
    subject: 'Mathematics',
    points: 30,
    description: `## Fibonacci (JavaScript)

Generate and print the first 10 Fibonacci numbers.

**Expected Output:**
\`\`\`
0, 1, 1, 2, 3, 5, 8, 13, 21, 34
\`\`\``,
    starterCode: `function fibonacci(n) {\n    const seq = [0, 1];\n    for (let i = 2; i < n; i++) {\n        seq.push(seq[i - 1] + seq[i - 2]);\n    }\n    return seq.slice(0, n);\n}\n\nconsole.log(fibonacci(10).join(", "));\n`,
    hints: [
      'Start with [0, 1] and build up by pushing new values',
      'Each new element = sum of the two before it',
      'Array.push() appends to the end',
    ],
  },
  {
    slug: 'js-objects',
    title: 'Working with Objects',
    language: 'javascript',
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    difficulty: 'Intermediate',
    category: 'Objects',
    subject: 'Computer Science',
    points: 30,
    description: `## Working with Objects (JavaScript)

Objects store key-value pairs. Methods can access other properties using \`this\`.

**Expected Output:**
\`\`\`
Name: Alex
Subject: Mathematics
Grade: A
Summary: Alex studies Mathematics and achieved grade A
\`\`\``,
    starterCode: `const student = {\n    name: "Alex",\n    subject: "Mathematics",\n    grade: "A",\n    getSummary() {\n        return \`\${this.name} studies \${this.subject} and achieved grade \${this.grade}\`;\n    }\n};\n\nconsole.log("Name:", student.name);\nconsole.log("Subject:", student.subject);\nconsole.log("Grade:", student.grade);\nconsole.log("Summary:", student.getSummary());\n`,
    hints: [
      'Access properties with dot notation: object.property',
      'Inside a method, "this" refers to the object',
      'Template literals: `${this.name}` inside backticks',
    ],
  },

  // ── JAVA ─────────────────────────────────────────────────────────────────
  {
    slug: 'java-hello',
    title: 'Hello, Java!',
    language: 'java',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    difficulty: 'Beginner',
    category: 'Basics',
    subject: 'Computer Science',
    points: 15,
    description: `## Hello, Java!

Java is used for Android apps, enterprise systems, and much more. Every Java program needs a class and \`main\` method.

**Expected Output:**
\`\`\`
Hello, World!
Welcome to the Plug Coding Lab!
\`\`\``,
    starterCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        System.out.println("Welcome to the Plug Coding Lab!");\n    }\n}\n`,
    hints: [
      'Java uses System.out.println() to print',
      'Every program needs a class (Main) and main method',
      'Java statements must end with a semicolon ;',
    ],
  },
  {
    slug: 'java-loops',
    title: 'Loops in Java',
    language: 'java',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    difficulty: 'Intermediate',
    category: 'Loops',
    subject: 'Computer Science',
    points: 30,
    description: `## Loops in Java

Print the multiplication table for 7 (7×1 through 7×10).

**Expected Output:**
\`\`\`
7 x 1 = 7
7 x 2 = 14
...
7 x 10 = 70
\`\`\``,
    starterCode: `public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 10; i++) {\n            System.out.println("7 x " + i + " = " + (7 * i));\n        }\n    }\n}\n`,
    hints: [
      'Java for loop: for (int i = 1; i <= 10; i++)',
      'String concatenation with + operator',
      'Wrap arithmetic in parentheses inside string concat: (7 * i)',
    ],
  },

  // ── C++ ──────────────────────────────────────────────────────────────────
  {
    slug: 'cpp-hello',
    title: 'Hello, C++!',
    language: 'cpp',
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    difficulty: 'Beginner',
    category: 'Basics',
    subject: 'Computer Science',
    points: 15,
    description: `## Hello, C++!

C++ powers game engines, operating systems, and high-performance computing. It gives you fine control over memory.

**Expected Output:**
\`\`\`
Hello, World!
C++ is fast and powerful!
\`\`\``,
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    cout << "C++ is fast and powerful!" << endl;\n    return 0;\n}\n`,
    hints: [
      '#include <iostream> gives access to cout',
      'cout << "text" << endl; prints a line',
      'Unlike Python, C++ needs semicolons and a return statement',
    ],
  },
  {
    slug: 'cpp-fibonacci',
    title: 'Fibonacci in C++',
    language: 'cpp',
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    difficulty: 'Intermediate',
    category: 'Algorithms',
    subject: 'Mathematics',
    points: 35,
    description: `## Fibonacci in C++

Generate the first 10 Fibonacci numbers.

**Expected Output:**
\`\`\`
0 1 1 2 3 5 8 13 21 34
\`\`\`

C++ is significantly faster than Python for computation — important for large Fibonacci values.`,
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 0, b = 1;\n    for (int i = 0; i < 10; i++) {\n        cout << a;\n        if (i < 9) cout << " ";\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    cout << endl;\n    return 0;\n}\n`,
    hints: [
      'Use two variables a and b for consecutive Fibonacci numbers',
      'int temp = a + b; a = b; b = temp; advances the sequence',
      'Check i < 9 before printing a space to avoid trailing space',
    ],
  },
  {
    slug: 'cpp-bubble-sort',
    title: 'Bubble Sort in C++',
    language: 'cpp',
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    difficulty: 'Advanced',
    category: 'Sorting',
    subject: 'Computer Science',
    points: 50,
    description: `## Bubble Sort in C++

Sort an array using Bubble Sort and print the result.

**Input:** \`{64, 34, 25, 12, 22, 11, 90}\`

**Expected Output:**
\`\`\`
Sorted: 11 12 22 25 34 64 90
\`\`\``,
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n    int n = 7;\n\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n\n    cout << "Sorted: ";\n    for (int i = 0; i < n; i++) {\n        cout << arr[i];\n        if (i < n - 1) cout << " ";\n    }\n    cout << endl;\n    return 0;\n}\n`,
    hints: [
      'C++ arrays: int arr[] = {values}',
      'Swap using a temp variable: temp = a; a = b; b = temp',
      'Outer loop runs n-1 times, inner loop shrinks each pass',
    ],
  },
];
