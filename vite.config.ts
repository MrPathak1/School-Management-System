import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LOCAL_RESPONSES: Record<string, string> = {
  fee: 'Fee payments can be made online via the Fees section in your dashboard. You can pay using the online payment gateway with credit/debit cards. Fee structures vary by class — view your fee breakdown and pay in full or installments. Contact the admin for due date extensions.',
  attendance: 'Attendance is marked by your class teacher each day. You can view your attendance record in the Attendance tab of your dashboard. Parents can also monitor attendance through the Parent Portal.',
  schedule: 'Class schedules are managed by the admin. Check the Schedule tab in your dashboard to view your weekly timetable including subject timings and teacher details.',
  homework: 'Assignments are posted by teachers under the Assignments tab. Submit your work before the due date. Late submissions may be penalized as per school policy.',
  exam: 'Exams are created and managed by teachers. You can take online exams under the Exams tab in your dashboard. Results are auto-graded and published instantly.',
  grade: 'Grades are published by teachers after exams and assignments. View your academic performance in the Report Card/Grades section of your dashboard.',
  bus: 'School bus routes and schedules are managed by the admin. Check the Bus Tracking section for route details, driver information, and stop locations.',
  holiday: 'School holidays are announced by the admin. Check the Notices section for upcoming holidays and important dates.',
  library: 'The school library is open during school hours. Students can borrow books for up to two weeks. Late returns incur a small fine.',
  sports: 'Sports activities are organized throughout the year. Students can participate in cricket, football, basketball, athletics, and more.',
  transport: 'School transport services are available for students. Bus fees are included in the annual fee structure. Contact the transport department for route changes.',
  teacher: 'Teachers can be contacted via the school communication system during school hours. Parent-teacher meetings are held quarterly.',
  parent: 'Parents can access their child\'s academic performance, attendance, and fee details through the Parent Portal. Contact the admin for login assistance.',
  login: 'Use your registered email to log in. Students use their school email, while parents use their registered guardian email. Contact admin if you face login issues.',
  password: 'If you forget your password, contact the school admin to reset it. Password reset through email is not currently available.',
  register: 'New student registration is handled by the admissions office. Contact the school front desk for registration forms and procedures.',
  admission: 'Admissions are open for the academic year. Visit the school office with required documents including birth certificate, previous report cards, and passport photos.',
  document: 'Upload and manage your documents in the Documents section. You can upload report cards, certificates, and other academic documents.',
  payment: 'Online payments can be made via credit/debit cards. All transactions are secure and encrypted. You will receive a receipt after successful payment.',
  receipt: 'Payment receipts are generated automatically after successful transactions. You can view and download receipts from the Fees section.',
  report: 'Report cards are published at the end of each term. View your academic report in the Report Card section. Parents can also access through the Parent Portal.',
  result: 'Exam results are published online as soon as they are graded. Check the Exams or Report Card section for your results.',
  time: 'School timings are 8:00 AM to 2:30 PM, Monday through Friday. The school office is open from 7:30 AM to 4:00 PM.',
  uniform: 'School uniform is mandatory for all students. The uniform consists of white shirt, navy blue trousers/skirt, and black shoes. Sports uniform is required on PE days.',
  hello: 'Hello! Welcome to the Mr Pathak School Assistant. How can I help you today?',
  hi: 'Hi there! I\'m the school assistant. Ask me anything about school activities, academics, or administration.',
  thank: 'You\'re welcome! If you have any more questions, feel free to ask. Have a great day!',
};

function getLocalResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [keyword, response] of Object.entries(LOCAL_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return `I understand you're asking about "${input}". For accurate information, please contact the school admin office or your class teacher. You can also check the relevant section in your dashboard for more details.`;
}

// @ts-ignore
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'chat-api',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method not allowed');
            return;
          }

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { message } = JSON.parse(body);
              const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

              if (apiKey) {
                try {
                  const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model: 'gpt-3.5-turbo',
                      messages: [
                        { role: 'system', content: 'You are a helpful assistant for Mr Pathak School. Answer questions about academics, fees, attendance, exams, schedules, bus routes, documents, and other school-related topics. Be concise and friendly.' },
                        { role: 'user', content: message },
                      ],
                      max_tokens: 300,
                      temperature: 0.7,
                    }),
                  });

                  if (response.ok) {
                    const data = await response.json();
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ reply: data.choices[0].message.content }));
                    return;
                  }
                } catch (e) {
                  console.error('OpenAI API error:', e);
                }
              }

              const reply = getLocalResponse(message);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid request' }));
            }
          });
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
