<template>
  <div>
    <button type="button" @click.prevent="isOpen ? closeChat() : openChat()">
      Open
    </button>
    <chat-box
      :participants="participants"
      :messages="messages"
      :isOpen="isOpen"
      :onClose="onChatClose"
      :onSubmit="onMsgSubmit"
      :currentUser="currentUser"
      :whoTyping="whoTyping"
      :onType="onType"
    />
  </div>
</template>

<script>
import { io } from "socket.io-client";
import ChatBox from "./ChatBox.vue";

const TYPING_TIMER_LENGTH = 800; // ms

const getM = () => {
  let data = [];

  for (var i = 0; i < 10; i++) {
    data.push({
      id: i,
      author: participants[Math.floor(Math.random() * 2)],
      text: `Message number ${i}`,
      created_at: "2021-01-28 21:02:12",
    });
  }

  data = [
    ...data,
    ...[
      {
        id: 101,
        author: participants[0],
        text: "My first message",
        created_at: "2021-01-28 21:02:12",
      },
      {
        id: 102,
        author: participants[0],
        text: "My second message",
        created_at: "2021-01-28 21:02:12",
      },
      {
        id: 103,
        author: participants[1],
        text: "Hello world!",
        created_at: "2021-01-28 21:02:12",
      },
      {
        id: 104,
        author: participants[2],
        text: "The best chat!",
        created_at: "2021-01-28 21:02:12",
      },
    ],
  ];

  return data;
};

const participants = [
  {
    id: 1,
    name: "Andry",
    photoPath: "https://eu.ui-avatars.com/api/?name=A+J",
  },
  {
    id: 2,
    name: "Bob",
    photoPath: "https://eu.ui-avatars.com/api/?name=B+G",
  },
  {
    id: 3,
    name: "Charly",
    photoPath: "https://eu.ui-avatars.com/api/?name=C+H",
  },
];

const getP = () => {
  return participants;
};

export default {
  name: "Chat",
  components: {
    ChatBox,
  },
  mounted() {
    this.ticketToken = "tiket 1";
    this.userToken = "user";

    this.socket = io("http://localhost:2021", {
      query: this.addRequestSrcData({}),
    });

    this.socket.on("chat/get", (data) => {
      if (this.participants.length || this.messages.length) return;

      //data = JSON.parse(data);

      this.participants = data.participants;
      this.messages = data.messages;
    });

    this.socket.on("chat/add", (data) => {
      //data = JSON.parse(data);

      const newMessage = this.formatMessageFromServer(data);
      this.messages = [...this.messages, newMessage];
    });

    this.socket.on("typing", (data) => {
      //data = JSON.parse(data);

      const userId = data.user_id.toString();
      const exist =
        this.whoTyping.findIndex((i) => {
          return i.id.toString() === userId;
        }) != -1;

      if (!exist) {
        const user = this.findParticipant(data.user_id);
        this.whoTyping = [...this.whoTyping, user];
      }
    });

    this.socket.on("stop-typing", (data) => {
      //data = JSON.parse(data);

      const userId = data.user_id.toString();
      this.whoTyping = this.whoTyping.filter((p) => {
        return p.id.toString() !== userId;
      });
    });

    this.loadData();
  },
  data: () => ({
    messages: [],
    participants: [],
    ticketToken: null,
    userToken: null,
    isOpen: false,
    socket: null,
    currentUser: 1,
    whoTyping: [],
    lastTypingTime: null,
  }),
  methods: {
    findParticipant: function (id) {
      return this.participants.find(
        (item) => item.id.toString() === id.toString()
      );
    },
    openChat: function () {
      this.isOpen = true;
      this.currentUser = parseInt(
        document.getElementById("currentUser").value,
        10
      );
    },
    closeChat: function () {
      this.isOpen = false;
    },
    onMsgSubmit: function (message) {
      message = message.trim();
      if (message.length === 0) {
        return;
      }

      this.socket.emit(
        "stop-typing",
        this.addRequestSrcData({ user_id: this.currentUser })
      );
      this.socket.emit(
        "chat/add",
        this.addRequestSrcData({
          id: Date.now(),
          author: participants[0],
          text: message,
        })
      );
    },
    onChatClose: function () {
      this.closeChat();
    },
    onType: function (e) {
      console.log(e);

      this.socket.emit(
        "typing",
        this.addRequestSrcData({ user_id: this.currentUser })
      );

      this.lastTypingTime = new Date().getTime();

      setTimeout(() => {
        const typingTimer = new Date().getTime();
        const timeDiff = typingTimer - this.lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH) {
          this.socket.emit(
            "stop-typing",
            this.addRequestSrcData({ user_id: this.currentUser })
          );
        }
      }, TYPING_TIMER_LENGTH);
    },
    loadData: function () {
      this.socket.emit(
        "chat/get",
        this.addRequestSrcData({
          messages: getM(),
          participants: getP(),
        })
      );
    },
    addRequestSrcData: function (data) {
      return {
        roomId: `ticket-chat-${this.ticketToken}`,
        payload: {
          ...data,
          userToken: this.userToken,
          ticketToken: this.ticketToken,
        },
      };
    },
    formatMessageFromServer: function (message) {
      return message;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

<style lang="scss">
.tooltip {
  display: block !important;
  z-index: 10000;
  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 3px;
    padding: 5px 10px 4px;
  }
  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }
  &[x-placement^="top"] {
    margin-bottom: 5px;
    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  &[x-placement^="bottom"] {
    margin-top: 5px;
    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  &[x-placement^="right"] {
    margin-left: 5px;
    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
  &[x-placement^="left"] {
    margin-right: 5px;
    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
  &[aria-hidden="true"] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }
  &[aria-hidden="false"] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
  &.info {
    $color: rgba(#004499, 0.9);
    .tooltip-inner {
      background: $color;
      color: white;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }
    .tooltip-arrow {
      border-color: $color;
    }
  }
  &.popover {
    $color: #f9f9f9;
    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }
    .popover-arrow {
      border-color: $color;
    }
  }
}
</style>
