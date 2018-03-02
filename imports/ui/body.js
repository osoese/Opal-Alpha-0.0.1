import { Template } from 'meteor/templating';
import { Tokens } from '/imports/api/tasks.js';
import { Wallets } from '/imports/api/tasks.js';

import './body.html';
import ethers from 'ethers';//ethers makes a few things easier right now with wallet creation

var Web3 = require("web3");
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/<add your own key kere>'));
var web3 = new Web3(new Web3.providers.HttpProvider('https://jsonrpc.ellaism.org'));
var web3Provider = new ethers.providers.Web3Provider(web3.currentProvider);//for ethers
//var web3 = new Web3(new Web3.providers.HttpProvider(Web3.defaultProvider));
//var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
//console.log(web3.version);

//components on main wallet meteor page
Template.body.helpers({
  //returns all the tokens for gerneral price info compared to target currency
  //hard coded ella for now but may revise for wallet holder to enter any eth fork
  tokens() {
    return Tokens.find({});
  },
  //******returns one ticker and is not being used right now**********************
  currentTickerDisplay(){
    return Tokens.findOne({});
    //return "BTC: 0.01";
  },
  //******************************************************************************/
  //returns wallet and balance for now and will be expanded to all wallet info
  currentElla(){
    return Wallets.find();
    //return Wallets.find({}).map(function (a){ return a.qty; });//just some testing code
  }
});

Template.body.events({
  'click .accbutton,.ella_addr' (event) {
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

        //alert('before balance');
        //alert(web3.utils.isBN(web3.eth.getBalance(walletaddr)));
        //balance = web3.eth.getBalance(walletaddr.toString());

        //console.log("attempting conversion now");
        //balance = web3.utils.fromWei(balance.toString(),'ether');

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
  'click .acchistory' (event) {
    const search_address = document.getElementsByClassName("accinput")[0].value;

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
  var randText = "Start";
  for (var i = 0; i < array.length; i++) {
    randText += array[i] + " ";
  }
  return randText+new Date("YYYY-MM-DDTHH:MM:SSZ");
};

Template.body.events({
  'click .makewallet' (event) {


    //writing to tx panel for now eventually to file or save pk not sure yet
    var txPanel = document.getElementById("account_history");
    //need to store the original term and give random options also give user option to make one on their own
    var privateKeyGeneratorTerm = "May you always"+genRandomNumbers()+"be blessed with Ella"+new Date("YYYY-MM-DDTHH:MM:SSZ")+"Prosperity Happiness and Good Health";
    var shuffled = privateKeyGeneratorTerm.split('').sort(function(){return 0.5-Math.random()}).join('');
    privateKeyGeneratorTerm = shuffled;
    var shuffled = privateKeyGeneratorTerm.split('').sort(function(){return 0.5-Math.random()}).join('');
    privateKeyGeneratorTerm = shuffled;
    alert(privateKeyGeneratorTerm);

    //return;
    txPanel.innerHTML = "<div>Copy  down this key generation phrase: </div><div>" + privateKeyGeneratorTerm + "</div>";
    console.log("copy  down this key generation phrase: "+privateKeyGeneratorTerm);
    //txPanel.innerHTML = txPanel.innerHTML + "<div><img src='/img/ella.png' /></div>";

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
    var pdfContent = "<html><body><div>"+ txPanel.innerHTML +"</div></body></html>";
    doc.fromHTML(pdfContent, 10, 10, { 'width': 200 });

    /*****images were not working in pdf no matter what i did
    doc.setFont("arial","bold");
    doc.setFontSize(12);
    doc.text(10,20,'Ella Opal Wallet Generation File Version Alpha 0.0.1');
    doc.setFont("arial");
    doc.setFontSize(8);
    console.log(privateKeyGeneratorTerm.length);
    doc.text(10,40,'Key generation phrase: '+privateKeyGeneratorTerm);
    doc.text(10,60,'Private Key: '+privateKeyRaw);
    doc.text(10,80,'Address: '+wallet.address);
    var img = new Image();
    img.addEventListener('load', function() {
        var doc = new jsPDF();
        doc.addImage(img, 'png', 10, 50);
    });
    img.src = '/ui/img/ella.png';
    //doc.image('/ui/img/ella.png', 0, 15);
    ******/

    doc.save('Wallet'+new Date()+'.pdf');
    //need to remove this return to insert the wallet into mongo and it shows up top
    //return;//if testing PDF can skip inserting wallet to local db
    //end testing PDF


    Meteor.call('wallets.insert',newWalletAddress,0,privateKeyGeneratorTerm);
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

Template.body.events({
  'click .prepella' (event) {

    //address to send fromW
    console.log("from: " + document.getElementById("accinput").value + " to: "+ document.getElementById("accsend").value + " we are sending " + document.getElementById("amtsend").value);

    var pkSend = document.getElementById("pksend");
    var privateKey = pkSend.value;
    var walletAddress = document.getElementById("accinput").value;
    var amount = web3.utils.toWei(document.getElementById("amtsend").value,'ether');

    //this was the old ether code and I added back in ethers so kep it
    //var wallet2 = new ethers.Wallet(privateKey);
    //var providers = new ethers.providers.JsonRpcProvider('https://jsonrpc.ellaism.org');
    //wallet2.provider = new ethers.providers.JsonRpcProvider('https://jsonrpc.ellaism.org');

    var gasPrice = web3.eth.gasPrice;
    //alert(wallet2.provider.chainId);

    // We must pass in the amount as wei (1 ether = 1e18 wei), so we use
    // this convenience function to convert ether to wei.
    console.log("amount" + amount + ", and estimatedgas: " + gasPrice);
    //nonce
    var number = web3.eth.getTransactionCount(walletAddress);
    console.log("wallet address nonce: "+number); // 1

    console.log("web 3 version: "+Web3.version);//looking for 1.0.0 beta

    //need to enter PK now
    if((privateKey == "") || (!checkPK(privateKey))){
      console.log("enter your private key now and then hit send");
      //var pkSend = document.getElementById("pksend");
      pkSend.removeAttribute("disabled");
      pkSend.focus();
      document.getElementById("account_history").innerText = "enter private key and prepare again WARNING will send if correct!";
      return;
      //alert("will be activating the send button when pk enterred and validated");
    }else if(new ethers.Wallet(privateKey).address.toLowerCase() != walletAddress){
      document.getElementById("account_history").innerText = "private key is not correct for wallet edit and prepare again";
      return;
    }else{
      document.getElementsByClassName("sendellared")[0].className = "sendella";
      //right now just going to send here but need to activate green button as confirmation to send
      //and post the transaction in the innertext next line for confirmation
      document.getElementById("account_history").innerText = "Did it correct and now sending (warned you)....";
    }

    web3.eth.accounts.signTransaction({ to: document.getElementById("accsend").value, value: amount, gas: 2000000 }
    , privateKey)
    .then(function(rawtx) {
        console.log('Raw TX:'+ rawtx.rawTransaction);
        console.log('sending now');
        web3.eth.sendSignedTransaction(rawtx.rawTransaction).then(console.log);
    })
    .catch(function(rawtxError){
        console.log('Hmm.. there was an error: '+ String(rawtxError));
    });
        /*****test code for alternate trial efforts****************************
        var transaction = {
          from: wallet2.address,
          to: document.getElementById("accsend").value,
          value: amount,
          gas: gasPrice,
          nonce: number
        };
        web3.eth.sendTransaction(transaction, function(err, transactionHash) {
          if (!err){
            console.log(transactionHash);
          }else{
            console.log(err);
          }

        });
        *********************************************************************/
  }
});

Template.body.events({
  'mouseover .ella_addr' (event) {
        document.getElementsByClassName("accinput")[0].value = event.target.innerText;
        //var aa = document.getElementById("btc_prc").innerText;
        //var bb = document.getElementById("ella_qty_"+event.target.innerText).innerText;
        var btcPrice = (document.getElementById("btc_prc").innerText * document.getElementById("ella_qty_"+event.target.innerText).innerText);
        document.getElementById("btc").innerText = btcPrice.toPrecision(6);
        var usdPrice = (document.getElementById("usd_prc").innerText * document.getElementById("ella_qty_"+event.target.innerText).innerText);
        document.getElementById("usd").innerText = usdPrice.toPrecision(6);
        var eurPrice = (document.getElementById("eur_prc").innerText * document.getElementById("ella_qty_"+event.target.innerText).innerText);
        document.getElementById("eur").innerText = eurPrice.toPrecision(6);
        var ethPrice = (document.getElementById("eth_prc").innerText * document.getElementById("ella_qty_"+event.target.innerText).innerText);
        document.getElementById("eth").innerText = ethPrice.toPrecision(6);
        //document.getElementById("btc").innerText = "";
  }
});

Template.body.events({
  'click .button_tix' (event) {

    //*****************hardcoded for ELLA but will be dynamic in future*********************
    var url = 'https://min-api.cryptocompare.com/data/price?fsym=ELLA&tsyms=BTC,USD,EUR,ETH';

    //****removed this option for now*******************************************************
    //options = options || {};

    //if(options.extraParams)
    //    url += '&extraParams='+ options.extraParams;

    //****hijack the function to push ella to mongo******************************************
    var updatePrice = function(e, res){

        if(!e && res && res.statusCode === 200) {
            var content = JSON.parse(res.content);

            if(content){
                _.each(content, function(price, key){
                    var name = key.toLowerCase();

                    // make sure its a number and nothing else!
                    if(_.isFinite(price)) {
                        /******
                        EthTools.ticker.upsert(name, {$set: {
                            price: String(price),
                            timestamp: null
                        }});
                        *****/

                        /****
                        var doc = Tokens.findOne({ token: name });
                        Tokens.upsert({ _id: doc._id }, {$set:{token: name, price: String(price)}});
                        *****/

                        /*****
                        Tokens.insert({
                          token: name,
                          price: String(price) // current time
                        });
                        *****/
                        Meteor.call('tokens.insert', name, String(price.toPrecision(6)));
                        //there is a small bug may need to trigger another event to update tickers code below doesnt work
                        //document.getElementsByClassName('ella_addr')[0].mouseover();
                        //Template.body.helpers.tokens()
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
