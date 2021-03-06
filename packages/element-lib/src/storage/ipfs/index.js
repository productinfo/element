const ipfsClient = require('ipfs-http-client');

class IpfsStorage {
  constructor(multiaddr) {
    const parts = multiaddr.split('/');

    if (parts[1] === 'ip4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4] });
    }

    if (parts[1] === 'dns4') {
      this.ipfs = ipfsClient({ host: parts[2], port: parts[4], protocol: parts[5] });
    }
  }

  async write(object) {
    const [node] = await this.ipfs.add(Buffer.from(JSON.stringify(object)));
    return node.hash;
  }

  async read(cid) {
    const [node] = await this.ipfs.get(cid);
    return JSON.parse(node.content);
  }
}

const configure = ({ multiaddr }) => new IpfsStorage(multiaddr);

module.exports = {
  configure,
};
