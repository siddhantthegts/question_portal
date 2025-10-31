import passages from './passages';

const exams = [
  {
    examId: 1,
    examName: 'Mock CAT 2025',
    totalTime: 120 * 60, // seconds
    sections: [
      {
        sectionId: 1,
        sectionName: 'Verbal Ability and Reading Comprehension',
        time: 40 * 60,
        questions: [
          {
            questionId: 1,
            passageId: 1,
            text: 'We can infer that Sahlins\'s main goal in writing his essay was to:',
            options: [
              'highlight the fact that while we started off as a fairly contented egalitarian people, we have progressively degenerated into materialism.',
              'put forth the view that, despite egalitarian origins, economic progress brings greater inequality and social hierarchies.',
              'hold a mirror to an acquisitive society, with examples of other communities that have chosen successfully to be non-materialistic.',
              'counter Galbraith\'s pessimistic view of the inevitability of a capitalist trajectory for economic growth.',
            ],
            answer: 2,
          },
          {
            questionId: 2,
            passageId: 1,
            text: 'According to the passage, foragers demonstrate that societies make:',
            options: [
              'no deliberate choices and evolve randomly.',
              'real choices oriented around a distinct set of values.',
              'choices only when forced by environmental constraints.',
              'choices based solely on economic progress.',
            ],
            answer: 1,
          },
          {
            questionId: 3,
            passageId: 1,
            text: 'The author refers to the Neolithic Revolution to show that:',
            options: [
              'It improved human life by providing more food.',
              'It led to harsher work regimes and inequality.',
              'It marked the end of hunter-gatherer societies.',
              'It was a brief period of economic change.',
            ],
            answer: 1,
          },
        ],
      },
      {
        sectionId: 2,
        sectionName: 'Quantitative Ability',
        time: 40 * 60,
        questions: [
          {
            questionId: 4,
            text: 'What is the capital of France?',
            options: ['Paris', 'Berlin', 'Rome', 'Madrid'],
            answer: 0,
          },
          {
            questionId: 9,
            text: 'If 12 workers can complete a job in 15 days, how many days will 20 workers take?',
            options: ['9', '10', '11', '12'],
            answer: 0,
          },
          {
            questionId: 10,
            text: 'Simplify: (√50 + √8) equals',
            options: ['4√2', '5√2', '6√2', '7√2'],
            answer: 1,
          },
          {
            questionId: 11,
            text: 'What is the compound interest on ₹1000 at 10% p.a. for 2 years?',
            options: ['₹100', '₹200', '₹210', '₹220'],
            answer: 2,
          },
          {
            questionId: 12,
            text: 'The sum of first n natural numbers is?',
            options: ['n(n+1)/2', 'n^2', 'n(n-1)/2', '(n+1)(n+2)/2'],
            answer: 0,
          },
        ],
      },
      {
        sectionId: 3,
        sectionName: 'Data Interpretation and Logical Reasoning',
        time: 40 * 60,
        questions: [
          {
            questionId: 5,
            text: 'If the ratio of cats to dogs is 3:2 and there are 30 cats, how many dogs are there?',
            options: ['15', '18', '20', '25'],
            answer: 2,
          },
          {
            questionId: 6,
            text: 'A dataset has values {2,4,4,4,5,5,7,9}. What is the mode?',
            options: ['4', '5', '6', 'No mode'],
            answer: 0,
          },
          {
            questionId: 7,
            text: 'Which diagram is best suited to show parts of a whole?',
            options: ['Bar chart', 'Pie chart', 'Line graph', 'Histogram'],
            answer: 1,
          },
          {
            questionId: 8,
            text: 'If a train travels 60 km in 45 minutes, what is its average speed (km/h)?',
            options: ['60', '70', '80', '90'],
            answer: 3,
          },
        ],
      },
    ],
  },
];

export default exams;
