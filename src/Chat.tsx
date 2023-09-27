import * as React from "react";
import { Box, TextField, Button, Typography, Grid, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConstructionRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { resourceLimits } from "worker_threads";
import axios from "axios";
import { type } from "@testing-library/user-event/dist/type";
import { FaHeart } from "react-icons/fa";
import { FaRegSadCry } from "react-icons/fa";
import { FaRegLaughBeam } from "react-icons/fa";

type messageType = {
  id: number;
  text: string;
  sender: string;
  reactions: { reactionType: string; count: number }[];
};

const EmojiIcon = ({ type }: any) => {
  switch (type) {
    case "HEART":
      return <FaHeart />; // 여기에 해당하는 아이콘 컴포넌트를 사용
    case "SAD":
      return <FaRegSadCry />; // 여기에 해당하는 아이콘 컴포넌트를 사용
    case "LAUGH":
      return <FaRegLaughBeam />; // 여기에 해당하는 아이콘 컴포넌트를 사용
    default:
      return null;
  }
};

const ChatUI = () => {
  useEffect(() => {
    fetchMessages();
  }, []); // 컴포넌트가 마운트되면 fetchUsers 함수를 호출합니다. 이를 통해 최초 한 번만 데이터를 가져옵니다.

  const [messages, setMessages] = useState<messageType[]>([]);

  const fetchMessages = async () => {
    axios
      .get("http://localhost:8080/api/v1/getMessages")
      .then(function (response: any) {
        const transformedData = response.data.map((message: any) => ({
          id: message.messageId,
          text: message.text,
          sender: message.sender,
          reactions: ["HEART", "SAD", "LAUGH"].map((type) => ({
            reactionType: type,
            count: message.reactions.filter(
              (reaction: any) => reaction.reactionType === type
            ).length,
          })),
        }));

        setMessages(transformedData);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  };

  const userName = "user";
  const messageNotify = () => toast("Kafka messageEvent created!!");
  const reactionNotify = () => toast("Kafka reactionEvent created!!");

  const eventSource = new EventSource(
    `http://localhost:8081/SSE/subscribe/${userName}`
  );

  eventSource.addEventListener("sse", (event) => {
    console.log(event);

    if (event.data === "messageEvent") {
      messageNotify();
      console.log("message notify!!!");
      fetchMessages();
    }

    if (event.data === "reactionEvent") {
      reactionNotify();
      console.log("reaction notify!!!");
      fetchMessages();
    }
  });

  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      axios
        .post("http://localhost:8080/api/v1/sendMessage", {
          userName: "user",
          text: input,
          sender: "user",
        })
        .then(function (response: any) {
          console.log("sendMessage success");
        })
        .catch(function (error: any) {
          console.log(error);
        });
      console.log(input);
      setInput("");
    }

    console.log(messages);
  };

  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  return (
    <div>
      <ToastContainer></ToastContainer>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </Box>
        <Box sx={{ p: 2, backgroundColor: "background.default" }}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextField
                fullWidth
                placeholder="Type a message"
                value={input}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                fullWidth
                size="large"
                color="primary"
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSend}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
};

const Message = ({ message }: any) => {
  const isBot = message.sender === "bot";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        mb: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          backgroundColor: isBot ? "primary.light" : "secondary.light",
        }}
      >
        <Typography variant="body1">{message.text}</Typography>
        <Box sx={{ display: "flex", mt: 1 }}>
          {message.reactions.map((reaction: any) => (
            <Button
              key={reaction.reactionType}
              startIcon={<EmojiIcon type={reaction.reactionType} />}
              sx={{ mx: 1 }}
            >
              {reaction.count}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatUI;
