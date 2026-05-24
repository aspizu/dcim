![](docs/assets/screenshot.webp)

DCIM is a self-hostable photos app that runs on Cloudflare infra. Fork your own copy to host an instance. My instance is at [**dcim.aspiz.uk**](https://dcim.aspiz.uk)

DCIM is NOT encrypted at-rest, all photos and albums are publicly accessible if you know the UUID or hash.

DCIM can use any S3-compatible object storage, including self-hosted options (ex: minio, rustfs, etc.)

### Breakdown of pricing compared to alternatives:

Note that all these options give you 10GB of free storage.

| Service                                | Pricing Model             | Effective Cost for 2 TB / month |        Approx INR / month* | Notes                                                                       |
| -------------------------------------- | ------------------------- | ------------------------------: | -------------------------: | --------------------------------------------------------------------------- |
| Google                                 | Fixed consumer plan       |                               — |                   **₹650** | Includes ecosystem/apps, not raw object storage                             |
| Cloudflare                             | $0.015 / GB-month         |       2048 × 0.015 = **$30.72** |                **~₹2,560** | No egress fees; API/object storage                                          |
| Ente                                   | Fixed consumer plan       |                               — |                 **₹1,599** | Privacy-focused encrypted photos service                                    |
