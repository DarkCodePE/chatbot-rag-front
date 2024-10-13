import React from 'react';
import { ChevronLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import styles from './ChatInterface.module.css';

interface Message {
    type: string;
    content: string;
}

interface ActiveChatProps {
    chatSessionId: string;
    currentTopicTitle: string;
    chatHistory: Message[];
    question: string;
    isLoading: boolean;
    onBackClick: () => void;
    onQuestionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmitQuestion: () => void;
}

const ActiveChat: React.FC<ActiveChatProps> = ({
                                                   chatSessionId,
                                                   currentTopicTitle,
                                                   chatHistory,
                                                   question,
                                                   isLoading,
                                                   onBackClick,
                                                   onQuestionChange,
                                                   onSubmitQuestion
                                               }) => {
    const chatHistoryRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className={styles.chatSession}>
            <div className={styles.chatSessionHeader}>
                <button
                    aria-label="Back to chat list"
                    onClick={onBackClick}
                    className={styles.backButton}
                >
                    <ChevronLeftIcon/>
                </button>
                <h2 className={styles.chatSessionTitle}>{currentTopicTitle}</h2>
            </div>
            <div className={styles.chatContent}>
                <div className={styles.chatHistory} ref={chatHistoryRef}>
                    {chatHistory?.map((message, index) => (
                        <div
                            key={index}
                            className={`${styles.message} ${
                                message.type === 'user' ? styles.userMessage : styles.botMessage
                            }`}
                        >
                            <div className="author">
                                <span>{message.type === 'user' ? 'You' : 'Bot'}</span>
                            </div>
                            <div className="chat">
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.chatInput}>
                <input
                    value={question}
                    onChange={onQuestionChange}
                    placeholder="Type your message here..."
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSubmitQuestion();
                        }
                    }}
                    className={styles.inputField}
                />
                <button
                    onClick={onSubmitQuestion}
                    disabled={isLoading}
                    className={styles.sendButton}
                >
                    <ArrowRightIcon/>
                </button>
            </div>
        </div>
    );
};

export default ActiveChat;