export interface AppStep {
  order: number;
  title: string;
  details: string;
  imageUrl: string;
}

export const APP_STEPS: AppStep[] = [
  {
    order: 1,
    title: 'Select Chart Abstractions in the Menu',
    details: 'In the left side navigation window, select "Chart Abstractions". You will be taken to a list of existing patient forms. These may either have logic running in the background or already be completed.',
    imageUrl: '/assets/img/sample_screenshot.png'
  },
  {
    order: 2,
    title: 'Start a New Chart Abstraction',
    details: 'Click the "Start New Form" button to begin a new chart abstraction. You will be prompted to select a form template and search for or select a patient.',
    imageUrl: '/assets/img/sample_screenshot.png'
  },
  {
    order: 3,
    title: 'Select an Active Chart Abstraction',
    details: 'From the list of active forms, click on a form to open it. You can filter and sort the list to find specific forms.',
    imageUrl: '/assets/img/sample_screenshot.png'
  },
  {
    order: 4,
    title: 'Fill Out Your Form',
    details: 'Review the evidence retrieved from the patient\'s medical record and fill out the form fields. SmartChart will suggest answers based on the evidence found.',
    imageUrl: '/assets/img/sample_screenshot.png'
  },
  {
    order: 5,
    title: 'Submit Your Form',
    details: 'Once you have completed all required fields, review your entries and submit the form. The completed form will be saved and can be exported if needed.',
    imageUrl: '/assets/img/sample_screenshot.png'
  }
];
