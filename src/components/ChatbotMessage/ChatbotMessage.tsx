import React, { useEffect, useState } from 'react';
import ConditionallyRender from 'react-conditionally-render';

import ChatbotMessageAvatar from './ChatBotMessageAvatar/ChatbotMessageAvatar';
import Loader from '../Loader/Loader';

import './ChatbotMessage.css';
import { callIfExists } from '../Chat/chatUtils';
import { ICustomComponents, ICustomStyles } from '../../interfaces/IConfig';

interface IChatbotMessageProps {
  message: string;
  withAvatar?: boolean;
  loading?: boolean;
  messages: any[];
  delay?: number;
  id: number;
  setState?: React.Dispatch<React.SetStateAction<any>>;
  customComponents?: ICustomComponents;
  customStyles: { backgroundColor: string };
}

const ChatbotMessage = ({
                          message,
                          withAvatar = true,
                          loading,
                          messages,
                          customComponents,
                          setState,
                          customStyles,
                          delay,
                          id
                        }: IChatbotMessageProps) => {
  const [show, toggleShow] = useState(false);

  useEffect(() => {
    let timeoutId: any;
    const disableLoading = (
      messages: any[],
      setState: React.Dispatch<React.SetStateAction<any>>
    ) => {
      let defaultDisableTime = calculateTime(message)

      timeoutId = setTimeout(() => {
        const newMessages = [...messages];
        const message = newMessages.find((message) => message.id === id);

        if (!message) return;
        message.loading = false;
        message.delay = undefined;

        setState((state: any) => {
          const freshMessages = state.messages;
          const messageIdx = freshMessages.findIndex(
            (message: any) => message.id === id
          );
          freshMessages[messageIdx] = message;
          return { ...state, messages: freshMessages };
        });
      }, defaultDisableTime);
    };

    disableLoading(messages, setState);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, id]);

  useEffect(() => {
    if (delay) {
      setTimeout(() => toggleShow(true), delay);
    } else {
      toggleShow(true);
    }
  }, [delay]);

  function calculateTime(dialogueLine: string) {
    const minTime = 1000;
    const maxTime = 2000;
    const delayPerCharInMSec = 65;
    let time = dialogueLine?.length * delayPerCharInMSec;
    if (time < minTime) {
      return minTime;
    }
    return time > maxTime ? maxTime : time;
  };


  const chatBoxCustomStyles = { backgroundColor: '' };
  const arrowCustomStyles = { borderRightColor: '' };

  if (customStyles) {
    chatBoxCustomStyles.backgroundColor = customStyles.backgroundColor;
    arrowCustomStyles.borderRightColor = customStyles.backgroundColor;
  }

  return (
    <ConditionallyRender
      condition={show}
      show={
        <div className='react-chatbot-kit-chat-bot-message-container'>
          <ConditionallyRender
            condition={withAvatar}
            show={
              <ConditionallyRender
                condition={!!customComponents?.botAvatar}
                show={callIfExists(customComponents?.botAvatar)}
                elseShow={<ChatbotMessageAvatar />}
              />
            }
            elseShow={<div className={'react-chatbot-kit-chat-bot-avatar-no-logo'} />}
          />

          <ConditionallyRender
            condition={!!customComponents?.botChatMessage}
            show={callIfExists(customComponents?.botChatMessage, {
              message,
              loader: <Loader />,
              loading
            })}
            elseShow={
              <div
                className='react-chatbot-kit-chat-bot-message'
                style={chatBoxCustomStyles}
              >
                <ConditionallyRender
                  condition={loading}
                  show={<Loader />}
                  elseShow={<span>{message}</span>}
                />
                <ConditionallyRender
                  condition={withAvatar}
                  show={
                    <div
                      className='react-chatbot-kit-chat-bot-message-arrow'
                      style={arrowCustomStyles}
                    ></div>
                  }
                />
              </div>
            }
          />
        </div>
      }
    />
  );
};

export default ChatbotMessage;
