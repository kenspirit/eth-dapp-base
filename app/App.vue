<template>
  <div id="app">
    <el-row :gutter="24">
      <el-col :span="20" :offset="2">
        <h1>Decentralized Secret Note</h1>
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="10" :offset="2">
        <h4>Connected to: <small class="text-muted">{{ networkName }}</small></h4>
      </el-col>
      <el-col :span="10">
        <h4>Gas Price: <small class="text-muted">{{ gasPrice }} ETH</small></h4>
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="10" :offset="2">
        <h5>Eth Account: <small class="text-muted">{{ account }}</small></h5>
      </el-col>
    </el-row>
    <el-row :gutter="24" class="main-form">
      <el-col :span="14" :offset="2">
        <el-form ref="noteForm" :model="noteForm" label-width="100px" :label-position="'left'" @submit.native.prevent>
          <el-form-item label="Note Name">
            <el-input v-model="noteForm.noteName"></el-input>
          </el-form-item>
          <el-form-item label="Content">
            <el-input type="textarea" v-model="noteForm.noteContent" :rows="5"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="small" @click="loadNote" plain>读取</el-button>
            <el-button size="small" @click="newNote" plain>新建</el-button>
            <el-button size="small" type="primary" @click="saveNote" plain>保存</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Vue from 'vue';
import { Row, Col, Form, FormItem, Input, Button } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Contract from 'truffle-contract';
import SecretNoteDef from '../build/contracts/SecretNote.json';

const SecretNote = Contract(SecretNoteDef);
const CONTRACT_ADDRESS = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';

Vue.use(Row);
Vue.use(Col);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Button);

let web3js;

export default {
  name: 'app',
  data () {
    return {
      networkName: 'unknown',
      gasPrice: 0,
      account: '',
      noteForm: {
        noteName: '',
        noteContent: ''
      }
    }
  },
  created() {
    if (typeof web3 !== 'undefined') {
      // Use MetaMask's provider
      web3js = new Web3(web3.currentProvider);
    } else {
      this.showAlertMsg('Please install <a href="https://metamask.io/" target="__blank">MetaMask</a> extension for your browser before using.', 'warning', 0);
      return;
    }

    SecretNote.setProvider(web3.currentProvider);

    // Async
    this.detectNetwork();
    this.getGasPrice();
    this.initAccount();
  },
  methods: {
    detectNetwork() {
      const that = this;
      web3js.version.getNetwork((err, netId) => {
        switch (netId) {
          case "1":
            that.networkName = 'mainnet';
            break;
          case "2":
            that.networkName = 'deprecated Morden test network';
            break;
          case "3":
            that.networkName = 'Ropsten test network';
            break;
          case "4":
            that.networkName = 'Rinkeby test network';
            break;
          case "42":
            that.networkName = 'Kovan test network';
            break;
          default:
            break;
        }
      });
    },
    getGasPrice() {
      const that = this;
      web3js.eth.getGasPrice(function(err, priceInWei) {
        that.gasPrice = web3js.fromWei(priceInWei, 'ether').toString(10);
      })
    },
    initAccount() {
      function _getAccount() {
        const that = this;

        web3js.eth.getAccounts(function(err, result) {
          if (err) {
            return;
          }

          if (result.length === 0 || result[0] === that.account) {
            return;
          }

          that.account = result[0];
        });
      }

      setInterval(_getAccount.bind(this), 100);
    },
    loadNote() {
      const that = this;

      SecretNote.at(CONTRACT_ADDRESS)
        .then((instance) => {
          return instance.getNote(that.noteForm.noteName);
        })
        .then((noteContent) => {
          if (!noteContent) {
            return;
          }
          that.noteForm.noteContent = web3js.toAscii(noteContent);
        });
    },
    saveNote() {
      const that = this;

      SecretNote.at(CONTRACT_ADDRESS)
        .then((instance) => {
          return instance.setNote(that.noteForm.noteName,
            that.noteForm.noteContent, { from: that.account });
        });
    },
    newNote() {
      this.noteForm.noteName = '';
      this.noteForm.noteContent = '';
    },
    showAlertMsg(alertMsg, alertType = 'warning', duration = 3500) {
      this.$notify({
        title: '',
        dangerouslyUseHTMLString: true,
        message: alertMsg,
        type: alertType,
        showClose: true,
        center: true,
        duration
      });
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 20px;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-family: inherit;
  font-weight: 500;
  line-height: 1.2;
  color: inherit;
}
</style>
