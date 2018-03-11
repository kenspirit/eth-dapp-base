pragma solidity ^0.4.18;

contract Ownable {
    address owner;

    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
}

contract SecretNote is Ownable {
  mapping(address => mapping(bytes32 => bytes32)) notes;
  uint256 noteCount;

  event SecretNoteUpdated(address indexed _sender, bytes32 indexed _noteKey, bool _success);

  function SecretNote() public {
  }

  function () public payable {
  }

  /**
   * @dev For user to get their own secret note
   * @param _noteKey The key identifier for particular note
   */
  function getNote(bytes32 _noteKey) public view returns (bytes32) {
      return notes[msg.sender][_noteKey];
  }

  /**
   * @dev For user to update their own secret note
   * @param _noteKey The key identifier for particular note
   * @param _content The note path hash
   */
  function setNote(bytes32 _noteKey, bytes32 _content) public payable {
      require(_noteKey != "");
      require(_content != "");

      notes[msg.sender][_noteKey] = _content;
      noteCount++;

      SecretNoteUpdated(msg.sender, _noteKey, true);
  }

  function getTotalNoteCount() public view onlyOwner returns(uint256) {
      return noteCount;
  }
}
