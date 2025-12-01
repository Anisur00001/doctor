import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: 'Patient Login - BeyungCare+',
  description: 'Sign in to your BeyungCare+ account to access healthcare consultations.',
};

export default function PatientLoginPage() {
  return  <AuthForm type='login' userRole='patient'/>
}