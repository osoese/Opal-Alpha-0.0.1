# Opal-Alpha-0.0.1
EtherGem (EGEM) Opal Wallet Alpha 0.0.1 May 2018
Author: OSOESE
WELCOME PAGE - THIS IS ALPHA SOFTWARE PLEASE USE WITH CAUTION
-------------------------------------------------------------------------------------------------------------------------
**WARNING!** this wallet DOES NOT save private keys or UTC files
You **MUST** have a copy of your private key to use this wallet
Any wallets generated using the CREATE WALLET functin will prompt you to save and print the paper wallet with your
*private keys* and if you do not save that file you will *lose access to your funds* and these will be **UNRECOVERABLE**
Please back up and save your *private key* before sending any money to your wallet address
-------------------------------------------------------------------------------------------------------------------------

Note: I am using the convention that the user types into the command line interface (cli) everything after the $

To compile and run Opal Alpha 0.0.1 meteor app:

First install node and meteor (possibly using this link for meteor installer is easiest): https://www.meteor.com/install

then:

$git clone https://github.com/osoese/Opal-Alpha-0.0.1

$cd ~/Opal-Alpha-0.0.1

(if on windows 10 just delete the .meteor folder before issuing the next command)

$meteor create .

until I figure out why this didn't get added in package.json you need to then run

$meteor add http

This will spit out something like this: http: Make HTTP calls to remote servers

Then just:

$meteor

and your cli will direct you to open a browser to localhost:3000 where your app will be running

(if at this point you get errors please see DEBUG section at the bottom of this page)

This is the Opal Wallet Alpha release which means it is has features that a developer would use correctly the first try.
You, on the other hand, may need to think about them the first time. This is mainly because the developer is only hitting the sequence of buttons to get the desired feature he coded to work. While the developer of this wallet did test it with significant enough funds that it would hurt had they been lost, unintended results still may happen. This wallet was also used as a handy block explorer and reimbursement tool by the developer, so unintended results causing lost funds are not expected. However, caution is advised. For this reason the local data repository does not hold a private key. ~~This wallet will generate and save the "seed expression" which can derive the private key pretty easily,~~ **ALL** *features saving any private keys or regeneration techniques in the database have been removed.* A newly created wallet will generate a PDF printout with the private key and address **ONE TIME** and you must **SAVE THAT FILE** and **BACK IT UP**. Print the PDF and back it up in a safe location (offline). The author's preference would be for you to always save every key offline only using them when needed. The reality is that we have grown accustomed to keeping wallet accounts on desktops and hardware devices - even ones readily connected to the internet. A future release *may* hold the private keys if a request is made for this function. For now, transactions are forged "offline" and signed with your private key then broadcast to the blockchain very similarly to if you were using the My EGEM Wallet application (or My Ether Wallet on the Ethergem chain).

This is a meteor application. You will begin by either:
  1) generating a new wallet and saving the information from the PDF in several places offline, this function will save the wallet in the top section of your application after you create it. You can then transfer some money to that wallet for use. Or,...
  [ add picture ]
  2) entering the address of an existing wallet to which you hold the private key offline. After entering the address and hitting the account button you will see this wallet and any available balance add to the top section of your application.
  [ add picture ]
  You may use this application with ~~either parity or~~ (parity currently not on EGEM chain) GO-EGEM, or by using the RPC connection at egem.io (https://jsonrpc.egem.io/custom). Alpha release 0.0.2 will give you the option to switch this without editing the code. The default for now will be the ethergem connection to save needing to learn how to install those other softwares, and until we automate the process for a novice user.

  The tickers at the top of the screen (above your wallet collection show the currency exchange for BTC, USD, EUR and ETH for 1 EGEM.

  Your collection of wallets with available funds will show below those currency tickers also at the top of the application and this section will scroll if more wallets are entered than will share available space with the other functionality. When hovered the tickers below the wallet collection will display the available balance in BTC, USD, EUR and ETH. We will seek to update this list in Alpha 0.0.2 to add things like the Canadian dollar CAD and custom currencies or tickers that you desire to see as a general user. Maybe you use the Swiss Franc and that is more appealing to you.

  A send transaction consists of preparing the transaction. First you would hover over the wallet to send from and magically slide the cursor off of that wallet without accidentally scrolling over another wallet to prepopulate the sending from field. Alternatively you can also just copy and paste into that same field a wallet address. Then you will enter the amount to send in the amount field and hit prepare transaction. This will then enable the private key field for you to enter your private key. Then you will hit prepare again and if the private key is correct the transaction will enable and it will SEND. In Alpha release 0.0.2 the "send" button will enable for a confirmation before a send happens, but for this release it is going to send as soon as you put the correct private key and hit prepare the second time so please make sure you are ready for that in advance. Confirm your transaction before hitting the prepare button.

  There are no tokens in this release. Alpha 0.0.2 will have some token functionality and will quickly follow this initial release (which is really just an upload to baseline getting the git started)

  An electron application wrapper will hold this meteor application in Alpha 0.0.2 but is not being uploaded with this release. The electron wrapper will contain additional functionality and security and will also allow an easy install on multiple client operating systems.

  I hope you enjoy this alpha release of the EGEM Opal Wallet version 0.0.1 and that you can see the vision on why the EGEM community needs its own custom wallet and how this humble start can really become something great. If you have any questions or comments please feel free to email me at OSOESE@EGEM.IO or catch the members of EtherGem development team on the public discord at https://discord.gg/msruanZ - where we are always seeking new members for our development team.

  DEBUG Section:

  "Error: Cannot find module '@babel/runtime/helpers/builtin/objectSpread'"

  $meteor npm install @babel/runtime@latest

  then rerun the command to start the process again

  $meteor

  KNOWN BUGS Section:

  "error transaction not mined in 50 blocks"

  The transaction you posted did not get mined in 50 blocks for some reason and this error will be trapped but at this time

  it is wise to just look at the explorer for the transaction id. It will eventually be mined in most cases. The block blockchain

  was just under a heavy load at the time you decided to broadcast.
