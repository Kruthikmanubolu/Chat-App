import ConversationFallback from '@/components/shared/conversation/ConversationFallback';
import { memo } from 'react';

type Props = {};

const ConversationsPage = (props:Props) => {
  return (
    <ConversationFallback />
  );
};

export default memo(ConversationsPage);