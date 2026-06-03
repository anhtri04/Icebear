# Icebear

**Icebear** is an open-source desktop application for exploring, understanding, and querying data stored in object storage services.

Modern applications increasingly store structured data in object storage systems such as Amazon S3, Cloudflare R2, MinIO, and other S3-compatible platforms. While object storage has become the foundation of modern data lakes and analytics platforms, the developer experience remains fragmented. Users often need to switch between cloud dashboards, command-line tools, SQL engines, and local applications just to inspect a dataset.

Icebear aims to solve this problem by providing a unified and intuitive graphical interface for object storage.

With Icebear, users can connect to multiple object storage providers, browse bucket hierarchies, inspect file metadata, preview datasets, analyze schemas, and query data without manually downloading files or building custom pipelines.

At its core, Icebear treats files as datasets rather than opaque objects. Whether the source is JSON, JSONL, CSV, or Parquet, Icebear automatically transforms data into a consistent tabular experience that is easy to explore and understand.

## Key Features

* Connect to Amazon S3, Cloudflare R2, MinIO, and other S3-compatible storage services
* Browse buckets, folders, and objects through a modern desktop interface
* Preview data stored in JSON, JSONL, CSV, and Parquet formats
* Automatically infer schemas and field types
* Query datasets using a visual query builder or SQL
* Inspect object metadata, storage usage, and dataset statistics
* Work locally without deploying additional backend services
* Cross-platform support for Windows, macOS, and Linux

## Vision

Icebear aspires to become the "MongoDB Compass for Object Storage"—a universal data explorer that bridges the gap between cloud object storage and developer productivity.

Instead of treating object storage as a collection of files, Icebear treats it as a collection of datasets, making modern data lakes accessible to developers, data engineers, platform teams, and cloud architects.

## Technology Stack

* Electron
* React + TypeScript
* DuckDB
* AWS SDK v3
* S3-Compatible APIs

## Project Status

Icebear is currently in the design and prototyping phase. The initial release focuses on object storage connectivity, dataset preview, schema inspection, and interactive querying. Future releases will expand support for data lake formats such as Apache Iceberg and Delta Lake, advanced analytics capabilities, and extensible plugin integrations.
