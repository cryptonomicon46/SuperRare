// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "./ISupeRare.sol";
import "./IERC721Metadata.sol";
import "./IERC721Receiver.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";


import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";



 contract SupeRareWrapper is Ownable, IERC721Metadata, IERC721 , ERC165, IERC721Receiver{  
    using SafeMath for uint256;
    using Address for address;
    address private  OriginalSupeRareAddr_;
    ISupeRare private supe;
    // Token name
    string private _name = "SupeRareWrapper";

    // Token symbol
    string private _symbol ="SUPRW";


    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;


/*
     *     bytes4(keccak256('balanceOf(address)')) == 0x70a08231
     *     bytes4(keccak256('ownerOf(uint256)')) == 0x6352211e
     *     bytes4(keccak256('approve(address,uint256)')) == 0x095ea7b3
     *     bytes4(keccak256('getApproved(uint256)')) == 0x081812fc
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
     *     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c5
     *     bytes4(keccak256('transferFrom(address,address,uint256)')) == 0x23b872dd
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) == 0x42842e0e
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) == 0xb88d4fde
     *
     *     => 0x70a08231 ^ 0x6352211e ^ 0x095ea7b3 ^ 0x081812fc ^
     *        0xa22cb465 ^ 0xe985e9c5 ^ 0x23b872dd ^ 0x42842e0e ^ 0xb88d4fde == 0x80ac58cd
     */
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    /*
     *     bytes4(keccak256('name()')) == 0x06fdde03
     *     bytes4(keccak256('symbol()')) == 0x95d89b41
     *     bytes4(keccak256('tokenURI(uint256)')) == 0xc87b56dd
     *
     *     => 0x06fdde03 ^ 0x95d89b41 ^ 0xc87b56dd == 0x5b5e139f
     */
    bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    /*
     *     bytes4(keccak256('totalSupply()')) == 0x18160ddd
     *     bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) == 0x2f745c59
     *     bytes4(keccak256('tokenByIndex(uint256)')) == 0x4f6ccce7
     *
     *     => 0x18160ddd ^ 0x2f745c59 ^ 0x4f6ccce7 == 0x780e9d63
     */
    bytes4 private constant _INTERFACE_ID_ERC721_ENUMERABLE = 0x780e9d63;


    constructor (address OriginalSupeRareAddr__){
        OriginalSupeRareAddr_ = OriginalSupeRareAddr__;
        supe = ISupeRare(OriginalSupeRareAddr_);
        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC721_METADATA);
        _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE); } 


    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view  override returns (string memory) {
        return supe.name();
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual override returns (string memory) {
        return supe.symbol();
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return supe.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        require(account != address(0), "ERC721: balance query for the zero address");
        return supe.balanceOf(account);
    }



    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return supe.ownerOf(tokenId);
        // return _tokenOwners.get(tokenId, "ERC721: owner query for nonexistent token");
    }


    /**
     * @dev See {IERC721-approve}.
     * @notice approve is not a supported function for this contract

     */
    function approve(address , uint256 ) public virtual override {
        revert("SupeRareWrapper: approve Not implemented!");

    }



        /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }


    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        _transfer(from, to, tokenId);
    }

        /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
             return (supe.approvedFor(tokenId) == spender|| supe.ownerOf(tokenId)== spender);
    }



    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
         return (supe.approvedFor(tokenId));
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address , bool ) public virtual override {
        revert("SupeRareWrapper: setApprovalForAll Not implemented!");
    }
    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address , address ) public view virtual override returns (bool) {
        revert("SupeRareWrapper: isApprovedForAll Not implemented!");
   
    }



    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal virtual {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }


    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        private returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }
        bytes memory returndata = to.functionCall(abi.encodeWithSelector(
            IERC721Receiver(to).onERC721Received.selector,
            _msgSender(),
            from,
            tokenId,
            _data
        ), "ERC721: transfer to non ERC721Receiver implementer");
        bytes4 retval = abi.decode(returndata, (bytes4));
        return (retval == _ERC721_RECEIVED);
    }
    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal virtual {

        (bool success, ) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("transfer(address,uint256)",to,tokenId));
         require(success,"SupeRareWrapper: Transfer of token failed!");     
        emit Transfer(from, to, tokenId);

    }


    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        // return this.onERC721Received.selector;
        return _ERC721_RECEIVED;
    }




    /**
     * @dev Adds a new unique token to the supply
     * @param _uri string metadata uri associated with the token
     */
    function addNewToken(string memory _uri) external virtual {
          (bool success, ) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("transfer(string)",_uri));
         require(success,"SupeRareWrapper: addNewToken action failed!");     

    }

    /**
     * @dev Adds a new unique token to the supply with N editions. The sale price is set for all editions
     * @param _uri string metadata uri associated with the token.
     * @param _editions uint256 number of editions to create.
     * @param _salePrice uint256 wei price of editions.
     */
    function addNewTokenWithEditions(string memory _uri, uint256 _editions, uint256 _salePrice) external virtual {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("addNewTokenWithEditions(string,uint256,uint256)",_uri,_editions,_salePrice));
         require(success,"SupeRareWrapper: addNewTokenWithEditions action failed!");     
    }



    /**
    * @dev Bids on the token, replacing the bid if the bid is higher than the current bid. You cannot bid on a token you already own.
    * @param _tokenId uint256 ID of the token to bid on
    */
    function bid(uint256 _tokenId) external virtual {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("bid(uint256)",_tokenId));
         require(success,"SupeRareWrapper: bid action failed!");     
    }


        /**
     * @dev Accept the bid on the token, transferring ownership to the current bidder and paying out the owner.
     * @param _tokenId uint256 ID of the token with the standing bid
     */
    function acceptBid(uint256 _tokenId) external virtual {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("acceptBid(uint256)",_tokenId));
         require(success,"SupeRareWrapper: acceptBid action failed!");     
    }


    /**
     * @dev Cancels the bid on the token, returning the bid amount to the bidder.
     * @param _tokenId uint256 ID of the token with a bid
     */
    function cancelBid(uint256 _tokenId) external virtual {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("cancelBid(uint256)",_tokenId));
         require(success,"SupeRareWrapper: cancelBid action failed!");    
    }


        /**
     * @dev Purchase the token if there is a sale price; transfers ownership to buyer and pays out owner.
     * @param _tokenId uint256 ID of the token to be purchased
     */
    function buy(uint256 _tokenId) external virtual {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("buy(uint256)",_tokenId));
         require(success,"SupeRareWrapper: buy action failed!");    
    }

        /**
     * @dev Set the sale price of the token
     * @param _tokenId uint256 ID of the token with the standing bid
     */
    function setSalePrice(uint256 _tokenId, uint256 _salePrice) external {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("setSalePrice(uint256,uint256)",_tokenId,_salePrice));
         require(success,"SupeRareWrapper: setSalePrice action failed!");    
    }

        /**
     * @dev Adds the provided address to the whitelist of creators
     * @param _creator address to be added to the whitelist
     */
    function whitelistCreator(address _creator) external {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("whitelistCreator(address)",_creator));
         require(success,"SupeRareWrapper: whitelistCreator action failed!");    
    }

        /**
     * @dev Set the maintainer Percentage. Needs to be 10 * target percentage
     * @param _percentage uint256 percentage * 10.
     */
    function setMaintainerPercentage(uint256 _percentage) public onlyOwner() {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("setMaintainerPercentage(uint256)",_percentage));
         require(success,"SupeRareWrapper: setMaintainerPercentage action failed!");    
    }

        /**
     * @dev Set the creator Percentage. Needs to be 10 * target percentage
     * @param _percentage uint256 percentage * 10.
     */
    function setCreatorPercentage(uint256 _percentage) public onlyOwner() {
        (bool success,) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("setCreatorPercentage(uint256)",_percentage));
         require(success,"SupeRareWrapper: setMaintainerPercentage action failed!");    
    }
    /** 
     * @dev Returns whether the creator is whitelisted
     * @param _creator address to check
     * @return bool 
     */
    function isWhitelisted(address _creator) external returns (bool) {
        // (bool success, bytes memory returndata) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("isWhitelisted(address)",_creator));
        //  require(success,"SupeRareWrapper: isWhitelisted action failed!");    
        // return abi.decode(returndata, (bool));
        return supe.isWhitelisted(_creator);
         }


    /**
    * @dev Gets the specified token ID of the uri. It only
    * returns ids of originals.
    * Throw if not connected to a token ID.
    * @param _uri string uri of metadata
    * @return uint256 token ID
    */
    function originalTokenOfUri(string memory _uri) external returns (uint256) {
        // (bool success, bytes memory returndata) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("originalTokenOfUri(string)",_uri));
        // require(success,"SupeRareWrapper: originalTokenOfUri action failed!");    
        // return abi.decode(returndata, (uint256));
        return supe.originalTokenOfUri(_uri);
    }


    /**
    * @dev Gets the current bid and bidder of the token
    * @param _tokenId uint256 ID of the token to get bid details
    * @return bid amount and bidder address of token
    */
    function currentBidDetailsOfToken(uint256 _tokenId) external returns (uint256, address) {
        // (bool success, bytes memory returndata) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("currentBidDetailsOfToken(uint256)",_tokenId));
        // require(success,"SupeRareWrapper: currentBidDetailsOfToken action failed!");    
        // return abi.decode(returndata, (uint256,address));
        return supe.currentBidDetailsOfToken(_tokenId);
    }

    /**
    * @dev Gets the creator of the token
    * @param _tokenId uint256 ID of the token
    * @return address of the creator
    */
    function creatorOfToken(uint256 _tokenId) external returns (address) {
        // (bool success, bytes memory returndata) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("creatorOfToken(uint256)",_tokenId));
        // require(success,"SupeRareWrapper: currentBidDetailsOfToken action failed!");    
        // return abi.decode(returndata, (address));
        return supe.creatorOfToken(_tokenId);

    }


    /**
    * @dev Gets the sale price of the token
    * @param _tokenId uint256 ID of the token
    * @return sale price of the token
    */
    function salePriceOfToken(uint256 _tokenId) external returns (uint256) {
        // (bool success, bytes memory returndata) = address(OriginalSupeRareAddr_).call(abi.encodeWithSignature("salePriceOfToken(uint256)",_tokenId));
        // require(success,"SupeRareWrapper: currentBidDetailsOfToken action failed!");    
        // return abi.decode(returndata, (uint256));
        return supe.salePriceOfToken(_tokenId);
    }


 }
