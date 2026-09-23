import { Injectable } from '@nestjs/common';
import * as http from 'http';

@Injectable()
export class VpsService {
  private host = process.env.HOST_SYSINFO_URL || 'http://127.0.0.1:3002';

  private httpGet(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      http.get(`${this.host}${path}`, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        });
      }).on('error', reject);
    });
  }

  getDiskInfo() {
    return this.httpGet('/disks');
  }

  getSystemStatus() {
    return this.httpGet('/status');
  }

  getCpuLoad() {
    return this.httpGet('/cpu-load');
  }

  getDockerContainers() {
    return this.httpGet('/docker');
  }
}
