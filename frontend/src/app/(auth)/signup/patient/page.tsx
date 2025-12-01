import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: 'Create Patient Account - BeyungCare+',
  description: 'Join BeyungCare+ to access quality healthcare consultations from certified doctors.',
};

export default function PatientSignUpPage() {
  return  <AuthForm type='signup' userRole='patient'/>
}