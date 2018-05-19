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
          })
          .catch(function(balanceError){
              console.log('Hmm.. there was an error: '+ String(balanceError));
          });
    }else{
        alert("address is blank or wrong choose enter or loose your choice");
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
      //for now this is to trap no wallet but will get all wallet history in future
      console.log("No address selected....rollover a wallet");
      document.getElementById("account_history").innerText = "No address selected....rollover a wallet and click again";
      return
    }
    web3.eth.getTransactionCount(search_address)
    .then(function(tx){
      document.getElementById("account_history").innerText = "transactions:"+tx;
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
    txPanel.innerHTML = txPanel.innerHTML + "<div>Write ths PK down: </div><div>"+ privateKeyRaw + "</div>";
    console.log("Write ths PK down: "+privateKeyRaw);
    Wallet = ethers.Wallet;
    wallet = new Wallet(privateKeyRaw);
    var newWalletAddress = wallet.address.toLowerCase();
    alert(newWalletAddress);
    console.log("Write down your address: "+newWalletAddress);
    txPanel.innerHTML = txPanel.innerHTML + "<div>Write down your address: </div><div>" + newWalletAddress + "</div>";
    //testing write a pdf
    var Doc = require("jsPDF");
    var doc = new Doc();
    var pdfHeader = "<div>OPAL EGEM PAPER WALLET - PRINT AND SAVE THIS FILE</div>";
    pdfHeader = pdfHeader + "<div>WITHOUT IT YOU WILL LOSE YOUR FUNDS</div>";
    var pdfContent = "<html><body>"+pdfHeader+"<div>"+ txPanel.innerHTML +"</div></body></html>";
    doc.fromHTML(pdfContent, 10, 10, { 'width': 200 });
    doc.save('Wallet'+new Date()+'.pdf');
    txPanel.innerHTML = txPanel.innerHTML + "<div>PRINT AND SAVE THAT FILE RIGHT NOW! This is the only chance you get.</div>";
    txPanel.innerHTML = txPanel.innerHTML + "<div>If you do not save this information funds from this wallet WILL BE LOST FOR GOOD.</div>";
    txPanel.innerHTML = txPanel.innerHTML + "<div>You will not be able to recover them ever without this information</div>";
    //removing capability to store prive key generation term
    //Meteor.call('wallets.insert',newWalletAddress,0,privateKeyGeneratorTerm);
    Meteor.call('wallets.insert',newWalletAddress,0);
  }

});

//function to check provate key mainly set up for improvements checks length now
//should also check for ishex and then we check acuatl key to walet below
function checkPK(pk){
  if(pk.length == 66){
    return true;
  }else{
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
      document.getElementById("account_history").innerText = "enter private key and hit prepare again to active the send button!";
      return;
      //alert("will be activating the send button when pk enterred and validated");
    }else if(new ethers.Wallet(privateKey).address.toLowerCase() != walletAddress){
      document.getElementById("account_history").innerText = "private key is not correct for wallet edit and hit prepare again";
      return;
    }else{
      document.getElementById("pksendbtn").removeAttribute("disabled");
      document.getElementById("pksendbtn").className = "btn btn-positive";
      //and post the transaction in the innertext next line for confirmation
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
    alert("You are sending "+amount+".... ....");

    web3.eth.accounts.signTransaction({ to: document.getElementById("accsend").value, value: amount, gas: 2000000 }
    , privateKey)
    .then(function(rawtx) {
        console.log('Raw TX:'+ rawtx.rawTransaction);
        console.log('sending now');
        web3.eth.sendSignedTransaction(rawtx.rawTransaction).then(function(rawTextTx){
          document.getElementById("account_history").innerHTML = "TxId: <a class='tinyhref' href='https://explorer.egem.io/tx/"+rawTextTx["transactionHash"]+"' target='new'>"+rawTextTx["transactionHash"]+"</a>";
          console.log(rawTextTx);
          pkSend.value = "";
          document.getElementById("pksendbtn").setAttribute("disabled",true);
          document.getElementById("pksendbtn").className = "btn btn-negative";
        }).catch(function(rawSendError){
            //insufficient funds for gas * price + value
            document.getElementById("account_history").innerHTML = 'Hmm.. there was an error: '+ String(rawSendError);
            console.log('Hmm.. there was an error: '+ String(rawtxError));
        });
    })
    .catch(function(rawtxError){
        //insufficient funds for gas * price + value
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
      event.target.parentElement.parentElement.style.backgroundColor="#8987df";
    }else{
      toggleDisplay(document.getElementById("events"),"","dec",event.target.id.replace("del_",""));
      console.log("un checked");
      event.target.parentElement.parentElement.style.backgroundColor="#e4ebfd";
    }

  },
  "click [data-action='accbutton/delete']" (event){
    console.log("Going to add a confirm function here too but for now we are deleting");
    var loopDelete = Wallets_del.find().forEach( function(myDoc) {Meteor.call('wallets.remove',myDoc.id);} );
    //while(Wallets_del.find)
  },
  "click [data-action='accbutton/export']" (event){
    console.log("File exported as Wallet Export.txt save as name of your choice");
    var blob = new Blob([JSON.stringify(Wallets_del.find())], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "WalletExport.txt");
  }
});

Template.body.events({
  "click [data-action='accbutton/wallet']" : function() {
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

  }
});
