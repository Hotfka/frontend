import * as React from "react";
import { Box, TextField, Button, Typography, Grid, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const messages = [
  { id: 1, text: "Hi there!", sender: "bot" },
  { id: 2, text: "Hello!", sender: "user" },
  { id: 3, text: "How can I assist you today?", sender: "bot" },
];

const ChatUI = () => {
  const userName = "user";
  const notify = () => toast("Kafka event created!!");

  const eventSource = new EventSource(
    `http://localhost:8081/SSE/subscribe/${userName}`
  );

  eventSource.addEventListener("sse", (event) => {
    console.log(event);

    if (event.data === "event") {
      notify();
      console.log("notify!!!");
    }
  });

  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      console.log(input);
      setInput("");
    }
    const maxId = messages.reduce(
      (max, message) => (message.id > max ? message.id : max),
      0
    );

    messages.push({ id: maxId + 1, text: input, sender: "user" });
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
      </Paper>
    </Box>
  );
};

export default ChatUI;
