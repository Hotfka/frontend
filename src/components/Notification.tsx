import React from "react";

class NotificationExample extends React.Component {
  showNotification() {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("새로운 메세지 이벤트가 발생했습니다.", {
            body: "이벤트 발생!!!",
          });
        }
      });
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.showNotification}>알림 보내기</button>
      </div>
    );
  }
}

export default NotificationExample;
