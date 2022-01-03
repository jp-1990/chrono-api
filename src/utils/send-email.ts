import emailjs from '@emailjs/browser';

type TemplateParams = {
  userName: string;
  email: string;
  url: string;
};

const templateId = 'chrono_1q6wyjf';

export const sendEmail = async (templateParams: TemplateParams) => {
  const response = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    templateId,
    templateParams,
    process.env.EMAILJS_USER_ID
  );
  return response;
};
