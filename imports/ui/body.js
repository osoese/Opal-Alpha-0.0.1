//can all of this be condensed to one line?
import { Template } from 'meteor/templating';
import { Tokens } from '/imports/api/tasks.js';
import { Wallets } from '/imports/api/tasks.js';
import { Wallets_del } from '/imports/api/tasks.js';

import './body.html';
import ethers from 'ethers';//ethers makes a few things easier right now with wallet creation
var FileSaver = require('file-saver');
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("https://jsonrpc.egem.io/custom"));
//var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/<add your own key kere>'));
var web3Provider = new ethers.providers.Web3Provider("https://jsonrpc.egem.io/custom");//for ethers
//var web3 = new Web3(new Web3.providers.HttpProvider(Web3.defaultProvider));
//var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
//console.log(web3.version);

var globalMarkets = "off";
var globalMarketsTime = 0;
var autoUpdateMarket = function(start){
  console.log("the timeout worked. globalMarkets is "+globalMarkets+" and globalMarketsTime = "+globalMarketsTime);
  if(start){
    globalMarkets = "on";
    document.getElementById("globalMarkets").className = "btn btn-positive";
    globalMarketsTime = 10;
    document.getElementById("timer_ctdn").innerText = globalMarketsTime;
  }
  if(globalMarkets == "on" && globalMarketsTime > 0){
    globalCaller();
    globalWallets();
    setTimeout(function(){ autoUpdateMarket(); }, 30000);
    globalMarketsTime--;
    document.getElementById("timer_ctdn").innerText = globalMarketsTime;
  }else{
    globalMarkets = "off";
    document.getElementById("globalMarkets").className = "btn btn-default";
    document.getElementById("timer_ctdn").innerText = "";
  }
};

//components on main wallet meteor page
Template.body.helpers({
  //returns all the tokens for gerneral price info compared to target currency
  //hard coded EGEM for now but may revise for wallet holder to enter any eth fork
  tokens() {
    return Tokens.find({});
  },
  //******returns one ticker and is not being used right now**********************
  currentTickerDisplay(){
    return Tokens.findOne({name:"btc"});
    //return "BTC: 0.01";
  },
  //******************************************************************************/
  //returns wallet and balance for now and will be expanded to all wallet info
  currentEGEM(){
    return Wallets.find();
    //return Wallets.find({}).map(function (a){ return a.qty; });//just some testing code
  },
  //******returns one ticker and is not being used right now**********************
  currentWalletDisplay(addr){
    return Wallets.find({public:addr});
    //return "BTC: 0.01";
  },
});

function messageAlerts(){
  document.getElementById("account_history_panel").className = "wallet_panels_flash";
  document.getElementById("account_history").style.color = "#a51603";
  setTimeout("document.getElementById('account_history_panel').className = 'wallet_panels';document.getElementById('account_history').style.color = '#959fb2';",3000);
  return;
}

Template.body.events({
  "click [data-action='accbutton/account'],.egem_addr" (event) {
    if(event.target.id != "add_send_wallet"){
      document.getElementsByClassName("accinput")[0].value = event.target.innerText;
    }
    var walletaddr = document.getElementsByClassName("accinput")[0].value.toLowerCase();
    console.log(document.getElementsByClassName("accinput")[0].value + " - " + walletaddr);
    if(walletaddr && (RegExp("^0x[a-fA-F0-9]{40}$").test(walletaddr))){//web3.utils.isAddress(address) can be used
        web3.eth.getBalance(walletaddr.toString())
          .then(function(balancewei) {
              var balance = web3.utils.fromWei(balancewei.toString(),'ether');
              //up sert into mongo wallet and balance
              Meteor.call('wallets.insert',walletaddr,balance)
              console.log('Balance:'+ balance);
              messageAlerts();
              document.getElementById("account_history").innerText= "address holds "+balance+" EGEM, and is available in your wallet. REMINDER: You still need your private key to access funds";
          })
          .catch(function(balanceError){
              console.log('Hmm.. there was an error: '+ String(balanceError));
          });
    }else{
      messageAlerts();
      document.getElementById("account_history").innerText= "address is blank or wrong choose enter or loose your choice";
    }

    web3.eth.getGasPrice()
      .then(function(gasprice) {
          //gasprice = web3.utils.fromWei(pricewei.toString(),'ether');
          console.log('GAS PRICE:'+ gasprice);
      })
      .catch(function(priceError){
          console.log('Hmm.. there was an error: '+ String(priceError));
      });
  }
});

Template.body.events({
  "click [data-action='accbutton/history']" (event) {
    const search_address = document.getElementsByClassName("accinput")[0].value;
    if (search_address == ""){
      messageAlerts();
      //for now this is to trap no wallet but will get all wallet history in future
      console.log("No address selected....rollover a wallet");
      document.getElementById("account_history").innerText = "No address selected....rollover and click a wallet then try again";
      return
    }
    web3.eth.getTransactionCount(search_address)
    .then(function(tx){
      messageAlerts();
      document.getElementById("account_history").innerHTML = "transactions:"+tx+" <a class='tinyhref' href='https://explorer.egem.io/addr/"+search_address+"' target='new'>"+search_address+"</a>";
    })
    .catch(function(txError){
      console.log("Hmmm there was an error: "+ String(txError));
    });
  }
})

//random function for wallet seed additions
genRandomNumbers = function getRandomNumbers() {
  var array = new Uint32Array(10);
  window.crypto.getRandomValues(array);
  var randText = "We began with an Ethereum Base and EtherGem Was Born";
  for (var i = 0; i < array.length; i++) {
    randText += array[i] + " ";
  }
  return randText+new Date("YYYY-MM-DDTHH:MM:SSZ");
};

Template.body.events({
  "click [data-action='wallet/create']" (event) {
    messageAlerts();
    //writing to tx panel for now eventually to file or save pk not sure yet
    var txPanel = document.getElementById("account_history");
    //need to store the original term and give random options also give user option to make one on their own
    var privateKeyGeneratorTerm = "May you always"+genRandomNumbers()+"be blessed with EGEM"+new Date("YYYY-MM-DDTHH:MM:SSZ")+"Prosperity Happiness and Good Health";
    var shuffled = privateKeyGeneratorTerm.split('').sort(function(){return 0.5-Math.random()}).join('');
    privateKeyGeneratorTerm = shuffled;
    var shuffled = privateKeyGeneratorTerm.split('').sort(function(){return 0.5-Math.random()}).join('');
    privateKeyGeneratorTerm = shuffled;
    //alert(privateKeyGeneratorTerm); //no one needs to know this information
    //removing key generation phrase from the life cycle
    //txPanel.innerHTML = "<div>Copy  down this key generation phrase: </div><div>" + privateKeyGeneratorTerm + "</div>";
    console.log("copy  down this key generation phrase: "+privateKeyGeneratorTerm);
    var privateKeyRaw = web3.utils.sha3(privateKeyGeneratorTerm);
    //alert(privateKeyRaw);
    txPanel.innerHTML = "<div style='font-size:11px;'>";
    txPanel.innerHTML = txPanel.innerHTML + "<div style='font-size:11px;'>Write ths PK down: </div><div style='font-size:13px;'>"+ privateKeyRaw + "</div>";
    console.log("Write ths PK down: "+privateKeyRaw);
    Wallet = ethers.Wallet;
    wallet = new Wallet(privateKeyRaw);
    var newWalletAddress = wallet.address.toLowerCase();
    //alert(newWalletAddress);
    console.log("Write down your address: "+newWalletAddress);
    txPanel.innerHTML = txPanel.innerHTML + "<div style='font-size:11px;'>Write down your address: </div><div style='font-size:13px;'>" + newWalletAddress + "</div>";
    //testing write a pdf
    var Doc = require("jsPDF");
    var doc = new Doc();
    var pdfHeader = "<div>OPAL EGEM PAPER WALLET - PRINT AND SAVE THIS FILE</div>";
    pdfHeader = pdfHeader + "<div>WITHOUT IT YOU WILL LOSE YOUR FUNDS</div>";
    var pdfContent = "<html><body>"+pdfHeader+"<div>"+ txPanel.innerHTML +"</div></body></html>";

    txPanel.innerHTML = txPanel.innerHTML + "<textarea style='font-size:12px;' cols='80' rows='2' wrap='hard' >private key: "+privateKeyRaw+" address: "+newWalletAddress+"</textarea>";
    txPanel.innerHTML = txPanel.innerHTML + "<div style='font-size:11px;'>PRINT AND SAVE THAT FILE RIGHT NOW! This is the only chance you get.</div>";
    txPanel.innerHTML = txPanel.innerHTML + "<div style='font-size:11px;'>If you do not save this information funds from this wallet WILL BE LOST FOR GOOD.</div>";
    txPanel.innerHTML = txPanel.innerHTML + "<div style='font-size:11px;'>You will not be able to recover them ever without this information</div></div>";

    doc.fromHTML(pdfContent, 10, 10, { 'width': 200 });
    doc.save('Wallet'+new Date()+'.pdf');

    //removing capability to store prive key generation term
    //Meteor.call('wallets.insert',newWalletAddress,0,privateKeyGeneratorTerm);
    Meteor.call('wallets.insert',newWalletAddress,0);
  }

});

//function to check provate key mainly set up for improvements checks length now
//should also check for ishex and then we check acuatl key to walet below
function checkPK(pk){
  if(pk.length == 66){
    console.log("password was 66 characters long: "+pk.length);
    return true;
  }else if(pk.length == 64){
    messageAlerts();
    document.getElementById("account_history").innerText = "adding a 0x to the front of your PK - please hit prepare again";
    console.log("adding a 0x to the front of your PK - please hit prepare again");
    pk.value = "0x"+pk.value;
    //console.log(pk.length);
    document.getElementById("pksend").value = "0x"+document.getElementById("pksend").value;
    return false;
    //if(checkPK(pk) == true){ return true; }else{ return false; }
  }else{
    console.log("password NOT 66 characters long: "+pk.length);
    messageAlerts();
    document.getElementById("account_history").innerText = "adding a 0x to the front of your PK - please hit prepare again";
    return false;
  }
}

var elCount = Array(2);
function toggleDisplay(el,multi,inc,str){
  var testObj = Wallets.find({"public":str}).fetch();
  if(typeof elCount[el.id] != "undefined"){
    var current = elCount[el.id];
    if(inc == "inc"){
      current++;
      Meteor.call('wallets_del.insert',testObj[0]["_id"],testObj[0]["public"]);
    }else{
      current--;
      Meteor.call('wallets_del.remove',testObj[0]["_id"]);
    }
    elCount[el.id] = current;
  }else{
    elCount = [el.id];
    elCount[el.id] = [1];
    Meteor.call('wallets_del.insert',testObj[0]["_id"],testObj[0]["public"]);
  };
  //multi is a flag to see if ther was more than one trigger and some are still open
  if(elCount[el.id] > 0){
    el.style.visibility = 'visible';
  }else{
    el.style.visibility = 'hidden';
  }
}

Template.body.events({
  "click [data-action='send/prepegem']" (event) {
    //need to add all console-log comments to a logger that the uer sees
    //address to send from
    console.log("from: " + document.getElementById("accinput").value + " to: "+ document.getElementById("accsend").value + " we are sending " + document.getElementById("amtsend").value);

    var pkSend = document.getElementById("pksend");
    var privateKey = pkSend.value;
    var walletAddress = document.getElementById("accinput").value;
    var amount = web3.utils.toWei(document.getElementById("amtsend").value,'ether');
    console.log("the amount is"+amount);
    var gasPrice = web3.eth.gasPrice;
    console.log("amount" + amount + ", and estimatedgas: " + gasPrice);
    //nonce
    var number = web3.eth.getTransactionCount(walletAddress);
    console.log("wallet address nonce: "+number); // 1
    console.log("web 3 version: "+Web3.version);//looking for 1.0.0 beta when written

    //need to enter PK now
    if((privateKey == "") || (!checkPK(privateKey))){
      console.log("enter your private key now and then hit send");
      pkSend.removeAttribute("disabled");
      pkSend.focus();
      document.getElementById("pkprepbtn").className = "btn btn-positive";
      messageAlerts();
      document.getElementById("account_history").innerText = "enter private key and hit prepare again to active the send button!";
      return;
      //alert("will be activating the send button when pk enterred and validated");
    }else if(new ethers.Wallet(privateKey).address.toLowerCase() != walletAddress){
      messageAlerts();
      document.getElementById("account_history").innerText = "private key is not correct for wallet edit and hit prepare again";
      return;
    }else{
      document.getElementById("pksendbtn").removeAttribute("disabled");
      document.getElementById("pkprepbtn").className = "btn btn-default";
      document.getElementById("pksendbtn").className = "btn btn-positive";
      //and post the transaction in the innertext next line for confirmation
      messageAlerts();
      document.getElementById("account_history").innerText = "activating Send button....Review your tx then hit send to confirm";
    }

    alert("Your tx is prepared. Review and confirm BEFORE you hit the send button because this action is irreversible. Hit send to continue...");

  }
});

Template.body.events({
  "click [data-action='show-hide-pk']" (event){
    if(document.getElementById("pksend").type == "password"){
      document.getElementById("pksend").type = "text";
    }else{
      document.getElementById("pksend").type = "password";
    }
  },
  "click [data-action='send/pksend']" (event){
    var amount = web3.utils.toWei(document.getElementById("amtsend").value,'ether');
    var pkSend = document.getElementById("pksend");
    var privateKey = pkSend.value;
    //alert("You are sending "+amount+".... ....");
    var r = confirm("Please confirm you are sending "+document.getElementById('amtsend').value+" EGEM.... hit cancel to exit");
    if (r == true) {
      messageAlerts();
      document.getElementById("account_history").innerHTML = "...sending "+document.getElementById("amtsend").value+" EGEM - wait for confirmation... ";
    } else {
      messageAlerts();
      document.getElementById("account_history").innerHTML = "You canceled the transaction at this time. It is still loaded. You can continue, change the amount, or move on.";
      return false;
    }

    web3.eth.accounts.signTransaction({ to: document.getElementById("accsend").value, value: amount, gas: 2000000 }
    , privateKey)
    .then(function(rawtx) {
        console.log('Raw TX:'+ rawtx.rawTransaction);
        console.log('sending now');
        web3.eth.sendSignedTransaction(rawtx.rawTransaction).then(function(rawTextTx){
          messageAlerts();
          document.getElementById("account_history").innerHTML = "TxId: <a class='tinyhref' href='https://explorer.egem.io/tx/"+rawTextTx["transactionHash"]+"' target='new'>"+rawTextTx["transactionHash"]+"</a>";
          console.log(rawTextTx);
          pkSend.value = "";
          document.getElementById("pksendbtn").setAttribute("disabled",true);
          document.getElementById("pksendbtn").className = "btn btn-negative";
        }).catch(function(rawSendError){
            //insufficient funds for gas * price + value
            messageAlerts();
            document.getElementById("account_history").innerHTML = 'Hmm.. there was an error: '+ String(rawSendError);
            console.log('Hmm.. there was an error: '+ String(rawtxError));
        });
    })
    .catch(function(rawtxError){
        //insufficient funds for gas * price + value
        messageAlerts();
        document.getElementById("account_history").innerHTML = 'Hmm.. there was an error: '+ String(rawtxError);
        console.log('Hmm.. there was an error: '+ String(rawtxError));
    });
  }
});

Template.body.events({
  'mouseover .egem_addr' (event){
        var btcPrice = (document.getElementById("btc_prc").innerText * document.getElementById("egem_qty_"+event.target.innerText).innerText);
        document.getElementById("btc").innerText = btcPrice.toPrecision(6);
        var usdPrice = (document.getElementById("usd_prc").innerText * document.getElementById("egem_qty_"+event.target.innerText).innerText);
        document.getElementById("usd").innerText = usdPrice.toPrecision(6);
        var eurPrice = (document.getElementById("eur_prc").innerText * document.getElementById("egem_qty_"+event.target.innerText).innerText);
        document.getElementById("eur").innerText = eurPrice.toPrecision(6);
        var ethPrice = (document.getElementById("eth_prc").innerText * document.getElementById("egem_qty_"+event.target.innerText).innerText);
        document.getElementById("eth").innerText = ethPrice.toPrecision(6);
  }
});

Template.body.events({
  "mouseover [data-action='accbutton/settings']" (event){
    //first we can hover and select one or multiple accounts
    //console.log("going to select account: "+event.target.id+" and "+event.target.parentElement.parentElement.id+"end");
    //need to make sure not already selected
    console.log("going to select account: "+event.target.id+" and "+event.target.parentElement.parentElement.id+"end");
    if (!event.target.checked){
      event.target.parentElement.parentElement.style.backgroundColor="#e4ebfd";
    }
  },
  "mouseout [data-action='accbutton/settings']" (event){
    //first we can hover and select one or multiple accounts
    //console.log("going to select account: "+event.target.id+" and "+event.target.parentElement.parentElement.id+"end");
    //need to make sure not already selected
    if (!event.target.checked){
      event.target.parentElement.parentElement.style.backgroundColor="";
    }
  },
  "click [data-action='accbutton/settings']" (event){
    if (event.target.checked){
      toggleDisplay(document.getElementById("events"),"","inc",event.target.id.replace("del_",""));
      console.log("checked account add to list: "+event.target.id+" and "+event.target.parentElement.parentElement.id+"end");
      event.target.parentElement.parentElement.style.backgroundColor="#b3c0e0";
      event.target.parentElement.parentElement.style.color="#0307c1";
    }else{
      toggleDisplay(document.getElementById("events"),"","dec",event.target.id.replace("del_",""));
      console.log("un checked");
      event.target.parentElement.parentElement.style.backgroundColor="#e4ebfd";
      event.target.parentElement.parentElement.style.color="#959fb2";
    }

  },
  "click [data-action='accbutton/delete']" (event){
    var r = confirm("Please confirm you are deleting the selected wallets from your account list. You can easily add them back.... hit cancel to exit with no action");
    if (r == true) {
      messageAlerts();
      document.getElementById("account_history").innerHTML = "Please confirm you are deleting the selected wallets from your account list. You can easily add them back.... hit cancel to exit with no action";
      var loopDelete = Wallets_del.find().forEach( function(myDoc) {Meteor.call('wallets.remove',myDoc.id);} );
    } else {
      messageAlerts();
      document.getElementById("account_history").innerHTML = "You canceled the deletion at this time. Your selections are still loaded. You can continue, select others, or move on.";
      return false;
    }

    //while(Wallets_del.find)
  },
  "click [data-action='accbutton/export']" (event){
    messageAlerts();
    document.getElementById("account_history").innerHTML = "This export function is disabled in revision 1 as we do not allow you to save PKs. Look for it in a future release";
    console.log("File [would have been] exported as Wallet Export.txt save as name of your choice [this function was disabled]");
    //var blob = new Blob([JSON.stringify(Wallets_del.find())], {type: "text/plain;charset=utf-8"});
    //FileSaver.saveAs(blob, "WalletExport.txt");
  }
});

var globalCaller = function() {
  //*****************hardcoded for EGEM but will be dynamic in future*********************
  //var url = 'http://api.egem.io/api/v1/egem_prices/';//errors
  var url = 'https://graviex.net/api/v2/tickers/egembtc';
  var url2 = 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BTC,USD,EUR,ETH';
  var btcprice;
  //****hijack the function to push EGEM to mongo******************************************
  var updatePrice = function(e, res){
      if(!e && res && res.statusCode === 200) {
          var content = JSON.parse(res.content);
          if(content){
              _.each(content, function(price, key){
                if(key=="ticker"){
                  console.log("last price"+price["last"]);
                  // make sure its a number and nothing else!
                  if(_.isFinite(price["last"])) {
                      Meteor.call('tokens.insert', "btc", String(price["last"]));
                      btcprice = price["last"];
                  }
                }
              });
          }
          HTTP.get(url2, updatePrice2);
      } else {
          console.warn('Can not connect to https://mini-api.cryptocompare.com to get price ticker data, please check your internet connection.');
      }
  };

  var updatePrice2 = function(e, res){
      if(!e && res && res.statusCode === 200) {
          var content = JSON.parse(res.content);
          if(content){
              _.each(content, function(price, key){
                  var name = key.toLowerCase();
                  // make sure its a number and nothing else!
                  if(_.isFinite(price)) {
                      price = (price*btcprice);
                      console.log("this price is "+price)
                      Meteor.call('tokens.insert', name, String(price.toPrecision(6)));
                  }
              });
          }
      } else {
          console.warn('Can not connect to https://mini-api.cryptocompare.com to get price ticker data, please check your internet connection.');
      }
  };

  // update right away
  HTTP.get(url, updatePrice);
  if(globalMarkets == "off"){
    setTimeout(function(){ autoUpdateMarket(true); }, 3000);
  }
}

var globalWallets = function(){
  var yourWallets = Wallets.find({});
  //this is the loop
  yourWallets.forEach( function(walletdata){
    //looping goes inside here
    console.log(walletdata.public+ "qty "+walletdata.qty);
    var walletaddr = walletdata.public;
    if(walletaddr && (RegExp("^0x[a-fA-F0-9]{40}$").test(walletaddr))){//web3.utils.isAddress(address) can be used
        web3.eth.getBalance(walletaddr.toString())
          .then(function(balancewei) {
              var balance = web3.utils.fromWei(balancewei.toString(),'ether');
              //up sert into mongo wallet and balance
              Meteor.call('wallets.insert',walletaddr,balance)
              console.log('Balance:'+ balance);
          })
          .catch(function(balanceError){
              console.log('Hmm.. there was an error: '+ String(balanceError));
          });
    }else{
        console.log("address was incorrect on update");
    }
    //end looping goes inside here
  });
  //end the loop

}

Template.body.events({
  "click [data-action='accbutton/wallet']" : function() {
    console.log("GM "+globalMarkets);
    if(globalMarkets == "off" && document.getElementById("timer_ctdn").innerText == ""){
      globalCaller();
      document.getElementById("timer_ctdn").innerText = parseInt(10);
      messageAlerts();
      document.getElementById("account_history").innerText = "Update timer was set to run every 30 seconds "+document.getElementById("timer_ctdn").innerText+" times. Click updater for more time.";
    }else if(globalMarketsTime < 110 && document.getElementById("timer_ctdn").innerText != "10"){
      globalMarketsTime = globalMarketsTime+10;
      document.getElementById("timer_ctdn").innerText = globalMarketsTime;
      messageAlerts();
      document.getElementById("account_history").innerText = "Update timer was set to run every 30 seconds "+document.getElementById("timer_ctdn").innerText+" times. Click updater for more time.";
    }
  }
});
