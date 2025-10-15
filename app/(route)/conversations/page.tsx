import ConversationFallback from '@/components/shared/conversation/ConversationFallback';
import { memo } from 'react';


const ConversationsPage = () => {
  return (
    <ConversationFallback />
  );
};

export default memo(ConversationsPage);