%define webappver WAVERSION
%define apachepath  ifelse(DISTRO,`rhel',`/etc/httpd/conf.d',DISTRO,`mes',`/etc/httpd/conf',`/etc/apache2/conf.d')
%define webappprefix	/usr/share/zarafa-webapp-source
%define distribname ifelse(DISTRO,`suse',`SuSE',DISTRO,`sles',`SuSE Linux Enterprise',DISTRO,`rhel',`RedHat Enterprise',`Generic')
# debian doesn't not have this define
%define _sysconfig /etc
ifelse(DISTRO,`sles',`
%define licensepath /usr/share/doc/packages',`
%define licensepath /usr/share/doc')

Name: zarafa-webapp-source
Epoch: 1
Version: %{webappver}
Release: REVISION
License: AGPLv3
Group: Productivity/Networking/Email
Vendor: Zarafa
Packager: Zarafa
URL: http://www.zarafa.com/
Distribution: %{distribname}
Autoreqprov: on
Source: zarafa-webapp-source.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-build
BuildRequires: coreutils
BuildArchitectures: noarch
Requires: php-mapi >= ZARAFA_VERSION_REQUIRED zarafa-contacts >= ZARAFA_VERSION_REQUIRED
Summary: New and improved WebApp for the Zarafa Collaboration Platform

%description 
Uncompressed, uncombined and fully commented Javascript files for the WebApp.


%prep
%setup -q -n zarafa-webapp-%{release}

%build

%install
[ "$RPM_BUILD_ROOT" != "/" ] && [ -d $RPM_BUILD_ROOT ] && rm -rf $RPM_BUILD_ROOT;

install -d -m 755 $RPM_BUILD_ROOT/%{webappprefix}
install -d -m 755 $RPM_BUILD_ROOT/%{apachepath}
install -d -m 755 $RPM_BUILD_ROOT/%{_sysconfig}/zarafa/webapp
install -d -m 755 $RPM_BUILD_ROOT/var/lib/zarafa-webapp/tmp
install -d -m 755 $RPM_BUILD_ROOT/%{licensepath}/zarafa-webapp-source

#cp -a .htaccess client server *.dist *.php *.conf $RPM_BUILD_ROOT/%{webappprefix}
cp -a source/* source/.htaccess $RPM_BUILD_ROOT/%{webappprefix}
cp -a AGPL-3 $RPM_BUILD_ROOT/%{licensepath}/zarafa-webapp-source/LICENSE

mv $RPM_BUILD_ROOT/%{webappprefix}/config.php.dist $RPM_BUILD_ROOT/etc/zarafa/webapp/config-source.php
ln -sf %{_sysconfig}/zarafa/webapp/config-source.php $RPM_BUILD_ROOT/%{webappprefix}/config.php

mv $RPM_BUILD_ROOT/%{webappprefix}/debug.php.dist $RPM_BUILD_ROOT/%{webappprefix}/debug.php

mv $RPM_BUILD_ROOT/%{webappprefix}/zarafa-webapp.conf $RPM_BUILD_ROOT/%{apachepath}/zarafa-webapp-source.conf
sed -i $RPM_BUILD_ROOT/%{apachepath}/zarafa-webapp-source.conf -e 's/webapp/webapp-source/g'

%clean
[ "$RPM_BUILD_ROOT" != "/" ] && [ -d $RPM_BUILD_ROOT ] && rm -rf $RPM_BUILD_ROOT;

define(ATTRIB,
ifelse(DISTRO,`suse',`%attr(-,wwwrun,www)',
DISTRO,`sles',`%attr(-,wwwrun,www)',
`%attr(-,apache,apache)'))

%files
%defattr(-,root,root)
%dir %{webappprefix}/
%dir /var/lib/zarafa-webapp
%dir %{licensepath}/zarafa-webapp-source
ATTRIB %dir /var/lib/zarafa-webapp/tmp
%{webappprefix}/.htaccess
%{webappprefix}/*
%{licensepath}/zarafa-webapp-source/*
%config %dir %{_sysconfdir}/zarafa/webapp
%config(noreplace) %{_sysconfdir}/zarafa/webapp/config-source.php
%config(noreplace) %{apachepath}/zarafa-webapp-source.conf

%changelog
* DATE - development@zarafa.com
- current release
* Thu Jun 14 2012 - john@zarafa.com
- create package
