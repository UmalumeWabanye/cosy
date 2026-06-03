"use client";

import LandlordLayout from '@/components/landlord/LandlordLayout';
import MessagingPanel from '@/components/Messaging/MessagingPanel';

interface Participant {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  property?: { _id: string; propertyName?: string; city?: string } | null;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  text: string;
  sender: Participant;
  createdAt: string;
}

export default function LandlordMessagesPage() {
  return (
    <LandlordLayout>
      <MessagingPanel propertiesPath="/landlord/properties" />
    </LandlordLayout>
  );
}