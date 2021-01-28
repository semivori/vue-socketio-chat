<template>
  <div ref="chatBox" class="chat-box" :class="{ open: isOpen, close: !isOpen }">
    <div class="chat-box-header">
      {{ title }}
      <span class="chat-box-toggle" @click="onClose">
        <i class="fas fa-times"></i>
      </span>
    </div>
    <div class="chat-box-body">
      <div class="chat-box-overlay"></div>
      <div ref="scrollList" class="chat-logs">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="{
            'chat-msg': true,
            self: message.author.id === currentUser,
            user: message.author.id !== currentUser,
          }"
        >
          <span class="msg-avatar">
            <img
              v-tooltip="message.author.name"
              :src="message.author.photoPath"
            />
          </span>
          <div
            v-tooltip="formatMsgDate(message.created_at)"
            class="cm-msg-text"
          >
            {{ message.text }}
          </div>
        </div>

        <div class="chat-msg typing" v-if="typingMessage">
          <div class="cm-msg-text">
            {{ typingMessage }}
            <span class="typing-animation">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>

        <div :style="{ clear: 'both' }"></div>
      </div>
    </div>
    <div class="chat-input">
      <form>
        <textarea
          v-model="message"
          type="text"
          id="chat-input"
          placeholder="Send a message..."
          :min-height="47"
          :max-height="100"
          :rows="1"
          @input="onType"
        />
        <button
          @click.prevent="submit"
          type="submit"
          class="chat-submit"
          id="chat-submit"
        >
          <i class="far fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import * as moment from "moment";

export default {
  name: "ChatBox",
  props: {
    participants: Array,
    messages: Array,
    whoTyping: Array,
    onSubmit: Function,
    onType: Function,
    onClose: Function,
    isOpen: Boolean,
    currentUser: Number,
  },
  data: () => ({
    message: null,
    isInitScrolled: false,
  }),
  computed: {
    otherParticipants() {
      return this.participants.filter((p) => p.id !== this.currentUser);
    },
    title() {
      if (this.otherParticipants.length === 0) {
        return "You";
      }
      if (this.otherParticipants.length > 1) {
        return "You, " + this.otherParticipants[0].name + " & others";
      }

      return "You & " + this.otherParticipants[0].name;
    },
    typingMessage() {
      const otherParticipants = this.whoTyping.filter(
        (p) => p.id !== this.currentUser
      );

      if (otherParticipants.length === 0) {
        return null;
      }
      const names = otherParticipants.map((i) => i.name).join(", ");
      const verb = otherParticipants.length === 1 ? "is" : "are";

      return `${names} ${verb} typing`;
    },
  },
  updated() {
    if (this.isOpen) {
      this.$nextTick(this.scrollDown());
      this.$nextTick(() => {
        this.$refs.chatBox.focus();
      });
    }
  },
  // mounted() {
  //   this.$refs.messageInput.$el.addEventListener(
  //     "keydown",
  //     (e) => {
  //       if (e.keyCode == 13) {
  //         console.log(this.$refs.messageInput.$el.offsetHeight);
  //         this.logsHeight =
  //           400 - (this.$refs.messageInput.$el.offsetHeight - 47);
  //       }
  //     },
  //     false
  //   );
  // },
  methods: {
    submit() {
      this.onSubmit(this.message);
      this.message = "";
    },
    shouldScrollToBottom() {
      const scrollTop = this.$refs.scrollList.scrollTop;
      return scrollTop > this.$refs.scrollList.scrollHeight - 600;
    },
    scrollDown() {
      console.log("sc", this.$refs.scrollList.scrollHeight);
      this.$refs.scrollList.scrollTop = this.$refs.scrollList.scrollHeight;
    },
    formatMsgDate(date) {
      return moment(date).calendar();
    },
  },
};
</script>

<style scoped>
.chat-box {
  --chat-primary-color: #5865c3;
  --chat-message-color: #5a5eb9;
}

.btn#my-btn {
  background: white;
  padding-top: 13px;
  padding-bottom: 12px;
  border-radius: 45px;
  padding-right: 40px;
  padding-left: 40px;
  color: var(--chat-primary-color);
}
#chat-overlay {
  background: rgba(255, 255, 255, 0.1);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: none;
}

.chat-box.close {
  display: none;
}

.chat-box.open {
  display: block;
}

.chat-box {
  background: #efefef;
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 350px;
  max-width: 85vw;
  max-height: 100vh;
  border-radius: 5px;
  /*   box-shadow: 0px 5px 35px 9px #464a92; */
  box-shadow: 0px 5px 35px 9px #ccc;
}
.chat-box-toggle {
  float: right;
  margin-right: 15px;
  cursor: pointer;
}
.chat-box-header {
  background: var(--chat-primary-color);
  height: 50px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  color: white;
  text-align: center;
  font-size: 20px;
  padding-top: 10px;
}
.chat-box-body {
  position: relative;
  height: 400px;
  height: auto;
  border: 1px solid #ccc;
  overflow: hidden;
}
.chat-box-body:after {
  content: "";
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAgOCkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgY3g9IjE3NiIgY3k9IjEyIiByPSI0Ii8+PHBhdGggZD0iTTIwLjUuNWwyMyAxMW0tMjkgODRsLTMuNzkgMTAuMzc3TTI3LjAzNyAxMzEuNGw1Ljg5OCAyLjIwMy0zLjQ2IDUuOTQ3IDYuMDcyIDIuMzkyLTMuOTMzIDUuNzU4bTEyOC43MzMgMzUuMzdsLjY5My05LjMxNiAxMC4yOTIuMDUyLjQxNi05LjIyMiA5LjI3NC4zMzJNLjUgNDguNXM2LjEzMSA2LjQxMyA2Ljg0NyAxNC44MDVjLjcxNSA4LjM5My0yLjUyIDE0LjgwNi0yLjUyIDE0LjgwNk0xMjQuNTU1IDkwcy03LjQ0NCAwLTEzLjY3IDYuMTkyYy02LjIyNyA2LjE5Mi00LjgzOCAxMi4wMTItNC44MzggMTIuMDEybTIuMjQgNjguNjI2cy00LjAyNi05LjAyNS0xOC4xNDUtOS4wMjUtMTguMTQ1IDUuNy0xOC4xNDUgNS43IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTg1LjcxNiAzNi4xNDZsNS4yNDMtOS41MjFoMTEuMDkzbDUuNDE2IDkuNTIxLTUuNDEgOS4xODVIOTAuOTUzbC01LjIzNy05LjE4NXptNjMuOTA5IDE1LjQ3OWgxMC43NXYxMC43NWgtMTAuNzV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjcxLjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjE3MC41IiBjeT0iOTUuNSIgcj0iMS41Ii8+PGNpcmNsZSBmaWxsPSIjMDAwIiBjeD0iODEuNSIgY3k9IjEzNC41IiByPSIxLjUiLz48Y2lyY2xlIGZpbGw9IiMwMDAiIGN4PSIxMy41IiBjeT0iMjMuNSIgcj0iMS41Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTkzIDcxaDN2M2gtM3ptMzMgODRoM3YzaC0zem0tODUgMThoM3YzaC0zeiIvPjxwYXRoIGQ9Ik0zOS4zODQgNTEuMTIybDUuNzU4LTQuNDU0IDYuNDUzIDQuMjA1LTIuMjk0IDcuMzYzaC03Ljc5bC0yLjEyNy03LjExNHpNMTMwLjE5NSA0LjAzbDEzLjgzIDUuMDYyLTEwLjA5IDcuMDQ4LTMuNzQtMTIuMTF6bS04MyA5NWwxNC44MyA1LjQyOS0xMC44MiA3LjU1Ny00LjAxLTEyLjk4N3pNNS4yMTMgMTYxLjQ5NWwxMS4zMjggMjAuODk3TDIuMjY1IDE4MGwyLjk0OC0xOC41MDV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxwYXRoIGQ9Ik0xNDkuMDUgMTI3LjQ2OHMtLjUxIDIuMTgzLjk5NSAzLjM2NmMxLjU2IDEuMjI2IDguNjQyLTEuODk1IDMuOTY3LTcuNzg1LTIuMzY3LTIuNDc3LTYuNS0zLjIyNi05LjMzIDAtNS4yMDggNS45MzYgMCAxNy41MSAxMS42MSAxMy43MyAxMi40NTgtNi4yNTcgNS42MzMtMjEuNjU2LTUuMDczLTIyLjY1NC02LjYwMi0uNjA2LTE0LjA0MyAxLjc1Ni0xNi4xNTcgMTAuMjY4LTEuNzE4IDYuOTIgMS41ODQgMTcuMzg3IDEyLjQ1IDIwLjQ3NiAxMC44NjYgMy4wOSAxOS4zMzEtNC4zMSAxOS4zMzEtNC4zMSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=");
  opacity: 0.1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100%;
  position: absolute;
  z-index: -1;
}
#chat-input {
  background: #f4f7f9;
  width: 100%;
  position: relative;
  height: 47px;
  padding-top: 10px;
  padding-right: 50px;
  padding-bottom: 10px;
  padding-left: 15px;
  border: none;
  resize: none;
  outline: none;
  border: 1px solid #ccc;
  color: #888;
  border-top: none;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  overflow: hidden;
  display: block;
}
.chat-input > form {
  margin-bottom: 0;
}
#chat-input::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  color: #ccc;
}
#chat-input::-moz-placeholder {
  /* Firefox 19+ */
  color: #ccc;
}
#chat-input:-ms-input-placeholder {
  /* IE 10+ */
  color: #ccc;
}
#chat-input:-moz-placeholder {
  /* Firefox 18- */
  color: #ccc;
}
.chat-submit {
  position: absolute;
  bottom: 3px;
  right: 10px;
  background: transparent;
  box-shadow: none;
  border: none;
  border-radius: 50%;
  color: var(--chat-primary-color);
  width: 35px;
  height: 35px;
}

.chat-submit {
  outline: none;
}

.chat-logs {
  padding: 15px 7px 1px 7px;
  height: 400px;
  overflow-y: scroll;
}

.chat-logs::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #f5f5f5;
}

.chat-logs::-webkit-scrollbar {
  width: 5px;
  background-color: #f5f5f5;
}

.chat-logs::-webkit-scrollbar-thumb {
  background-color: var(--chat-primary-color);
}

@media only screen and (max-width: 500px) {
  .chat-logs {
    height: 40vh;
  }
}

.chat-msg > .msg-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.chat-msg.user > .msg-avatar img {
  float: left;
}

.chat-msg.self > .msg-avatar img {
  float: right;
}

.cm-msg-text {
  background: white;
  padding: 8px 10px;
  color: #666;
  max-width: 75%;
  float: left;
  margin-left: 10px;
  position: relative;
  margin-bottom: 9px;
  border-radius: 3px;
}
.chat-msg {
  clear: both;
}
.chat-msg.self > .cm-msg-text {
  float: right;
  margin-right: 10px;
  background: var(--chat-message-color);
  color: white;
}
.chat-msg.typing > .cm-msg-text {
  padding: 0 10px;
  background-color: initial;
  max-width: 100%;
  float: initial;
}
.cm-msg-button > ul > li {
  list-style: none;
  float: left;
  width: 50%;
}
.cm-msg-button {
  clear: both;
  margin-bottom: 70px;
}

/**
 * ==============================================
 * Ayping Animation
 * ==============================================
 */
.typing-animation {
  font-size: 24px;
  font-weight: 600;
  line-height: 0;
}
.typing-animation > *:nth-child(1) {
  animation: typinganimation1 2s linear infinite;
}
.typing-animation > *:nth-child(2) {
  animation: typinganimation2 2s linear infinite;
}
.typing-animation > *:nth-child(3) {
  animation: typinganimation3 2s linear infinite;
}

@keyframes typinganimation1 {
  0% {
    opacity: 1;
  }
  65% {
    opacity: 1;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes typinganimation2 {
  0% {
    opacity: 0;
  }
  21% {
    opacity: 0;
  }
  22% {
    opacity: 1;
  }
  65% {
    opacity: 1;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes typinganimation3 {
  0% {
    opacity: 0;
  }
  43% {
    opacity: 0;
  }
  44% {
    opacity: 1;
  }
  65% {
    opacity: 1;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
