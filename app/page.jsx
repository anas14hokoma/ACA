import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login'); // صح: استدعاء داخل كمبوننت سيرفر
}
