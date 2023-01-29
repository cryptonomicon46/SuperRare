
// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
// pragma solidity ^0.4.18;

interface ISupeRare {




    
    /**
     * @notice A descriptive name for a collection of NFTs in this contract
     */
    function name() external pure returns (string memory);

    /**
     * @notice An abbreviated name for NFTs in this contract
     */
    function symbol() external pure returns (string memory _symbol);

      /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
  /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
  ///  3986. The URI may point to a JSON file that conforms to the "ERC721
  ///  Metadata JSON Schema".
  function tokenURI(uint256 _tokenId) external view returns (string memory);


      /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
    function approvedFor(uint256 _tokenId) external view returns (address);




  /**
  * @dev Gets the balance of the specified address
  * @param _owner address to query the balance of
  * @return uint256 representing the amount owned by the passed address
  */
  function balanceOf(address _owner) external view  returns (uint256);

    /**
  * @dev Gets the owner of the specified token ID
  * @param _tokenId uint256 ID of the token to query the owner of
  * @return owner address currently marked as the owner of the given token ID
  */
    function ownerOf(uint256 _tokenId) external view returns (address owner);


    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Sets the token to be on its second sale.
     * @param _to address to receive the ownership of the given token ID
     * @param _tokenId uint256 ID of the token to be transferred
     */
    function transfer(address _to, uint256 _tokenId) external ;

    /**
     * @notice approve is not a supported function for this contract
     */
    function approve(address _to, uint256 _tokenId) external;



    /**
     * @dev Adds a new unique token to the supply
     * @param _uri string metadata uri associated with the token
     */
    function addNewToken(string memory _uri) external;

    /**
     * @dev Adds a new unique token to the supply with N editions. The sale price is set for all editions
     * @param _uri string metadata uri associated with the token.
     * @param _editions uint256 number of editions to create.
     * @param _salePrice uint256 wei price of editions.
     */
    function addNewTokenWithEditions(string memory _uri, uint256 _editions, uint256 _salePrice) external;

    /**
    * @dev Bids on the token, replacing the bid if the bid is higher than the current bid. You cannot bid on a token you already own.
    * @param _tokenId uint256 ID of the token to bid on
    */
    function bid(uint256 _tokenId) external;

    /**
     * @dev Accept the bid on the token, transferring ownership to the current bidder and paying out the owner.
     * @param _tokenId uint256 ID of the token with the standing bid
     */
    function acceptBid(uint256 _tokenId) external;
 
     /**
     * @dev Purchase the token if there is a sale price; transfers ownership to buyer and pays out owner.
     * @param _tokenId uint256 ID of the token to be purchased
     */
    function buy(uint256 _tokenId) external;
 

    /**
     * @dev Set the sale price of the token
     * @param _tokenId uint256 ID of the token with the standing bid
     */
    function setSalePrice(uint256 _tokenId, uint256 _salePrice) external;
 

     /**
     * @dev Adds the provided address to the whitelist of creators
     * @param _creator address to be added to the whitelist
     */
    function whitelistCreator(address _creator) external;

    /**
     * @dev Set the maintainer Percentage. Needs to be 10 * target percentage
     * @param _percentage uint256 percentage * 10.
     */
    function setMaintainerPercentage(uint256 _percentage) external;
 
   /**
     * @dev Set the creator Percentage. Needs to be 10 * target percentage
     * @param _percentage uint256 percentage * 10.
     */
    function setCreatorPercentage(uint256 _percentage) external;
 
    /** 
     * @dev Returns whether the creator is whitelisted
     * @param _creator address to check
     * @return bool 
     */
    function isWhitelisted(address _creator) external returns (bool);


    /**
    * @dev Gets the specified token ID of the uri. It only
    * returns ids of originals.
    * Throw if not connected to a token ID.
    * @param _uri string uri of metadata
    * @return uint256 token ID
    */
    function originalTokenOfUri(string memory _uri) external returns (uint256);
 
   /**
    * @dev Gets the current bid and bidder of the token
    * @param _tokenId uint256 ID of the token to get bid details
    * @return bid amount and bidder address of token
    */
    function currentBidDetailsOfToken(uint256 _tokenId) external returns (uint256, address);
  

      /**
    * @dev Gets the creator of the token
    * @param _tokenId uint256 ID of the token
    * @return address of the creator
    */
    function creatorOfToken(uint256 _tokenId) external returns (address);




    /**
    * @dev Gets the sale price of the token
    * @param _tokenId uint256 ID of the token
    * @return sale price of the token
    */
    function salePriceOfToken(uint256 _tokenId) external returns (uint256);
 
}