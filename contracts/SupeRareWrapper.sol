// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
// import "./IERC721Addons.sol";

contract SupeRareWrapper is Ownable  {   
    address public immutable SupeOriginalAddr;

        // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    event ApprovedThisContract(uint256 tokenId);
    constructor (address _SupeOriginalAddr) {
        SupeOriginalAddr = _SupeOriginalAddr;

    }   



  /// @notice safeTransferFrom checks approval for this contract to use the asset before doing an ERC721 transfer
    /// @param from
    ///  emits a SwapCompleted event
    ///
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(SupeOriginalAddr.approvedFor(tokenId) == address(this),"WRAPPER_NOT_APPROVED!" );
    
        safeTransferFrom(from, to, tokenId, "");
    }


    function ApproveThisContract(uint tokenId) external view {
        require(SupeOriginalAddr.approvedFor(tokenId)!=0,"INVALID_TOKENID");
        require(SupeOriginalAddr.ownerOf(tokenId)== msg.sender ||SupeOriginalAddr.approvedFor(tokenId)== msg.sender ,"NOT_OWNER_OR_APPROVED");
        SupeOriginalAddr.approve(address(this),tokenId);
        emit ApprovedThisContract(tokenId);
    
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);

    }

       /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        require(getApproved(tokenId) != address(0), "ERC721: operator query for nonexistent token");
        address owner = ERC721Token.ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || ERC721Token.isApprovedForAll(owner, spender));
    }

  /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
  function getApproved(uint256 _tokenId) public view virtual override returns (address) {
    // return tokenApprovals[_tokenId];
    return SupeOriginalAddr.approvedFor(_tokenId);
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

    // /**
    //  * @dev See {IERC721-safeTransferFrom}.
    //  */
    // function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
    //     require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    //     _safeTransfer(from, to, tokenId, _data);
    //     clearApprovalAndTransfer(from, to, tokenId);

    // }



}