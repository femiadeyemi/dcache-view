dCache View
===========

### Table of Contents

1. [Introduction](#Introduction)
2. [Getting Started](#Getting-Started)
    - [Prerequisites](#Prerequisites)
    - [Build](#Build)
    - [Update](#Update)
3. [Features](#Features)
    - [List of available Features]()
    - [Upcoming Features]()
    - [How to request a Feature]()
4. [How to ...](#How-To)
    - [make dCache View aware of the OpenID set up](docs/how-tos/open-id.md)
5. [Versioning](#Versioning)
6. [Contributors](#Contributors)
7. [How to contribute](#How-to-contribute)
8. [License](#License)
9. [Acknowledgments](#Acknowledgments)


## Introduction

dCache View is a web application client for [dCache](https://dcache.org). Basically, it 
provide user interface for dCache to the end users, which enable users to interact with 
dCache storage system effortlessly. 

To see how dCache View look like and to have a feel about the application, try our live 
test machine called [Prometheus](https://prometheus.desy.de:3880). This test machine is 
a small dCache instance running the latest development build of dCache with the latest 
released version of dCache View.

## Getting Started

dCache View is part of [Frontend service](https://www.dcache.org/manuals/Book-5.0/config-frontend.shtml) 
in dCache. It uses the RESTful API in the frontend for most of the namespace operation. 
Also, it uses [WebDAV services](https://www.dcache.org/manuals/Book-5.0/config-frontend.shtml) 
for macaroon, read operation, write operation etc. 

A running dCache instance comes with dCache View. If you are running a system test, you can 
skip this process, since the default layout in system test come with frontend services running 
on different ports. In this case, dCache View will be running in these following: 
http://localhost:3880/ and https://localhost:3881/.

However, if you are interested in other packages apart from the system test, enabling dCache View 
is as simple as starting or adding a frontend service/door to your dCache domain. Say for example, 
you have a single domain called `dCacheDomain`, inside your layout file, which should be located 
at `/etc/dcache/layouts/<name-of-your-layout-file>.conf`. To add the frontend service just add the 
following: `[dCacheDomain/frontend]` also don't forget to add the WebDAV door, as pointed earlier 
dCache View relies on it. Finally, restart your dCache instance. Hence, your layout file should 
look like this:

```text
[dCacheDomain]
.
.
.

[dCacheDomain/webdav]
.
.
.

[dCacheDomain/frontend]

.
.
.
```

By default, dCache View is served from port 3880 but this is configurable 
(see [dCache book](https://www.dcache.org/manuals/book.shtml) for full details on what and how 
to configure all the necessary properties for both webDAV and frontend door).


Ideally, the top of all the supported branches in dCache View [repository](https://github.com/dCache/dcache-view) 
are production ready. If you are brave and want to live on the hedge or fiddle around with 
the source code, you can run the latest version of dCache View but first you need to make 
sure you have [these](#Prerequisites) ready. Next, follow the instruction [here on how to build](#Build) 
it and lastly, deploy it to your system by doing [this](#Update).

#### Prerequisites

- A running dCache instance (see https://www.dcache.org/manuals/Book-5.0/install.shtml on how to install 
    and start a small dCache instance)
- **Git** - see https://git-scm.com/book/en/v2/Getting-Started-Installing-Git on how to install git.
     Your system might have git already installed, check by running the following command: `git --version` 
     from the *terminal*. If you have it installed (or successful install), the result should look similar to:
     ```
     git version 2.10.1 (Apple Git-78)
     ```
- **Maven** - see https://maven.apache.org/install.html on how to install maven.
    After installation (or before installation to check if you have maven installed already), confirm 
    that this is successful, open a *terminal* and typed `mvn -v`. You should see something like:
    ```
    Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-10T17:41:47+01:00)
    Maven home: /opt/maven-3.3.9
    Java version: 1.8.0_181, vendor: Oracle Corporation
    Java home: /Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre
    Default locale: en_GB, platform encoding: UTF-8
    OS name: "mac os x", version: "10.13.6", arch: "x86_64", family: "mac"
    ```
- Get dCache View source code, use either: 
    ```git
    git clone https://github.com/dCache/dcache-view.git
    ```
    or download the zip file [here](https://github.com/dCache/dcache-view/archive/master.zip)

#### Build

Once you've make sure all the prerequisites requirements are met, open your *terminal* and do 
the following:

- change directory to the directory where you forked/downloaded dCache View: 
    ```sbtshell
    cd <path-to-directory>/dcache-view
    ```
- build 
    ```sbtshell
    mvn clean package
    ```
    
#### Update

After a successful build, directory name `target` will be created inside `dcache-view` folder. We are 
interested in these following files:

    - index.html
    - robots.txt
    - bower_components/
    - elements/
    - favicons/
    - scripts/
    - style/
    
How to update your dCache instant will depends on where it is, if it local, it is as simple as copying
those files listed above to `/usr/share/dcache/dcache-view/` or it equivalent. To copy these files and 
directories from the `target` directory to `/usr/share/dcache/dcache-view/`, in the *terminal* typed:
  ```sbtshell
  rm -rf /usr/share/dcache/dcache-view/* && mv -v <path-to-dir>/dcache-view/target/* /usr/share/dcache/dcache-view/
  ``` 
Remembered, this path: `/usr/share/dcache/dcache-view/` depends on your installation and the package 
you installed. For example, in the system test, this is equivalent to: 
```
<path-to-dcache-directory>/packages/system-test/target/dcache/share/dcache-view/
```

In the case where dCache is running on a remote machine, please use one of the method described 
[here](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Upload_files_to_a_web_server) 
to deploy or replaced the files listed above with the newly generated ones.

## Features



#### Available

Here are list of features available inside dCache View
<table>
  <tr>
    <th>#</th>
    <th>Feature</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>1.</th>
    <td>Listing & Navigation</th>
    <td>
     See the content of a directory with the possibilities of viewing the sub directories as well.
    </td>
  </tr>
  <tr>
    <td>2.</td>
    <td>Viewer</td>
    <td>
     Content of a file can be displayed in dCache View. At the moment, you can view:
     <div>
        <ul>
          <li>pdf files</li>
          <li>video files with these file extention: <code>.ogg, .mpeg, .webm and .mp4</code></li>
          <li>image files with these file extention: <code>.gif, .jpeg, .png, .x-icon and svg+xml</code></li>
        </ul>
     </div>
     <i>More file mime-type will be supported later.</i>
    </td>
  </tr>
  <tr>
    <td>3.</td>
    <td>User profile</td>
    <td>
        Shows detail user information with some few knobs that user can use 
        to set or remove some certain preferences.
    </td>
  </tr>
  <tr>
    <td>4.</td>
    <td>Authentication & Authorisation</td>
    <td>
        There are four options of authentication that are currently supported, these are:
        certificate, openID connect, macaroon and username+password.
    </td>
  </tr>
  <tr>
    <td>5.</td>
    <td>File Metadata</td>
    <td>
        See full file's metadata
    </td>
  </tr>
  <tr>
    <td>6.</td>
    <td>Sharing</td>
    <td>
    </td>
  </tr>
  <tr>
    <td>7.</td>
    <td>Multiple selection</td>
    <td></td>
  </tr>
  <tr>
    <td>8.</td>
    <td>Keyboard Shortcuts</td>
    <td></td>
  </tr>
  <tr>
    <td>9.</td>
    <td>Drag and drop</td>
    <td></td>
  </tr>
  <tr>
  <tr>
    <td>10.</td>
    <td>Custom context menu</td>
    <td></td>
  </tr>
  <tr>
    <td>11.</td>
    <td>Quality of service</td>
    <td>get the backend capabilities and able to update or modify specific file QoS</td>
  </tr>
  <tr>
    <td>12.</td>
    <td>Upload</td>
    <td></td>
  </tr>
  <tr>
    <td>13.</td>
    <td>Move</td>
    <td></td>
  </tr>
  <tr>
    <td>14.</td>
    <td>Rename</td>
    <td></td>
  </tr>
  <tr>
    <td>15.</td>
    <td>Download</td>
    <td></td>
  </tr>
  <tr>
    <td>16.</td>
    <td>Delete</td>
    <td></td>
  </tr>
</table>

#### Upcoming 

List of planned features and their progress


#### How to request a feature

If you have any suggestions on our features, please submit feedback on our feature requests [here]().

## How To

This is a list of 

- [make dCache View aware of the OpenID set up](docs/how-tos/open-id.md)

## Versioning

For the versions available, see the [tags on this repository](https://github.com/dCache/dcache-view/tags) 
for the prebuilds and [the nexus]() for the build ones. 

## Contributors

dCache View is part of dCache project, which is a joint venture between Deutsches Elektronen-Synchrotron, 
[DESY](https://www.desy.de/en), Fermi National Accelerator Laboratory, [FNAL](https://www.fnal.gov/) and 
Nordic DataGrid Facility, [NDGF](https://neic.no/nt1/).

## How to contribute

Please read [contributing instruction](CONTRIBUTING.md#Submitting-Pull-Requests) for details on our code of 
conduct, and the process for submitting pull requests to us. Also, if you hit an unknown bug, please 
[check here](CONTRIBUTING.md#Filing-Issues) for instructions on how to report a bug.

## License

The project is licensed under __AGPL v3__ - see the [LICENSE.md](LICENSE.md) file for details


## Acknowledgments
