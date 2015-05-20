%define webappver WAVERSION
%define apachepath  ifelse(DISTRO,`rhel',`/etc/httpd/conf.d',DISTRO,`mes',`/etc/httpd/conf',`/etc/apache2/conf.d')
%define webappprefix	/usr/share/zarafa-webapp
%define distribname ifelse(DISTRO,`suse',`SuSE',DISTRO,`sles',`SuSE Linux Enterprise',DISTRO,`rhel',`RedHat Enterprise',`Generic')
# debian doesn't not have this define
%define _sysconfig /etc
define(`SEPARATE_PLUGINLIST',`contactfax,dropboxattachment,facebook,gmaps,pimfolder,salesforce,spreed,sugarcrm,twidget')
define(`greplist', `translit(`$*', `,', `|')')
define(`INCLUDE_PLUGINLIST',`esyscmd(`find plugins/ -mindepth 1 -maxdepth 1 -type d ! -name .svn | sed -e s_plugins/__ | grep -Evw "'greplist(SEPARATE_PLUGINLIST)`" | sort | tr \\n , | sed -e s_,\$__ ')')
define(`getXMLTag', `cat plugins/$1/manifest.xml | sed -ne ''`s/^[ \t\r]*//;s_<$2>\(.*\)</$2>_\1_p;s/[ \t]*$//''` | tr -d \\\r | head -1')
define(`evalXMLTag',`esyscmd(getXMLTag($1,$2))')
define(exists, `syscmd(`test -r $1')dnl
ifelse(sysval,`0',`$2',`$3')')dnl
ifelse(DISTRO,`sles',`
%define licensepath /usr/share/doc/packages',`
%define licensepath /usr/share/doc')

Name: zarafa-webapp
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
Source: zarafa-webapp.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-build
BuildRequires: coreutils
BuildArchitectures: noarch
Requires: php-mapi >= ZARAFA_VERSION_REQUIRED zarafa-contacts >= ZARAFA_VERSION_REQUIRED
Summary: New and improved WebApp for the Zarafa Collaboration Platform

%description 
Provides a web-client written in PHP that uses JSON and Ext JS
to allow users to make full use of the Zarafa Collaboration Platform
through a modern web browser.

define(`PACKAGE',`dnl
%package $1
Group: Productivity/Networking/Email
Summary: Zarafa WebApp $1 plugin
Version: evalXMLTag($1,`version')
Release: REVISION
%description $1
evalXMLTag($1,`description')
')
define(`PACKAGES',`ifelse($1,`',,`PACKAGE($1)
PACKAGES(shift($@))')')
PACKAGES(SEPARATE_PLUGINLIST)


%prep
%setup -q -n zarafa-webapp-%{release}

%build

%install
[ "$RPM_BUILD_ROOT" != "/" ] && [ -d $RPM_BUILD_ROOT ] && rm -rf $RPM_BUILD_ROOT;

install -d -m 755 $RPM_BUILD_ROOT/%{webappprefix}
install -d -m 755 $RPM_BUILD_ROOT/%{apachepath}
install -d -m 755 $RPM_BUILD_ROOT/%{_sysconfig}/zarafa/webapp
install -d -m 755 $RPM_BUILD_ROOT/var/lib/zarafa-webapp/tmp
install -d -m 755 $RPM_BUILD_ROOT/%{licensepath}/zarafa-webapp

#cp -a .htaccess client server *.dist *.php *.conf $RPM_BUILD_ROOT/%{webappprefix}
cp -a deploy/* deploy/.htaccess $RPM_BUILD_ROOT/%{webappprefix}
cp -a AGPL-3 $RPM_BUILD_ROOT/%{licensepath}/zarafa-webapp/LICENSE

mv $RPM_BUILD_ROOT/%{webappprefix}/config.php.dist $RPM_BUILD_ROOT/etc/zarafa/webapp/config.php
ln -sf %{_sysconfig}/zarafa/webapp/config.php $RPM_BUILD_ROOT/%{webappprefix}/config.php

rm $RPM_BUILD_ROOT/%{webappprefix}/debug.php.dist
find $RPM_BUILD_ROOT/%{webappprefix}/ -name \*debug\* -print0 | xargs -0 rm

mv $RPM_BUILD_ROOT/%{webappprefix}/zarafa-webapp.conf $RPM_BUILD_ROOT/%{apachepath}

# move plugin configs
for plugin_config in $RPM_BUILD_ROOT/%{webappprefix}/plugins/*/config.php; do
	plugin=$(echo ${plugin_config} | sed -e 's_.*/plugins/\([^/]*\)/config.php_\1_')
	mv ${plugin_config} $RPM_BUILD_ROOT/etc/zarafa/webapp/config-${plugin}.php
	ln -sf %{_sysconfig}/zarafa/webapp/config-${plugin}.php ${plugin_config}
done


%clean
[ "$RPM_BUILD_ROOT" != "/" ] && [ -d $RPM_BUILD_ROOT ] && rm -rf $RPM_BUILD_ROOT;

define(ATTRIB,
ifelse(DISTRO,`suse',`%attr(-,wwwrun,www)',
DISTRO,`sles',`%attr(-,wwwrun,www)',
`%attr(-,apache,apache)'))
define(`PLUGINFILES_SECTION',`dnl
%dir %{webappprefix}/plugins/$1
%{webappprefix}/plugins/$1/*
exists(`plugins/$1/config.php',`%config(noreplace) %{_sysconfdir}/zarafa/webapp/config-$1.php')
')
define(`PLUGINFILES_SECTION_FULL',`dnl
%files $1
%defattr(-,root,root)
PLUGINFILES_SECTION($1)
')
define(`PLUGINFILES_FULL',`ifelse($1,`',,`PLUGINFILES_SECTION_FULL($1)dnl
PLUGINFILES_FULL(shift($@))')')
define(`PLUGINFILES_ONLY',`ifelse($1,`',,`PLUGINFILES_SECTION($1)dnl
PLUGINFILES_ONLY(shift($@))')')
define(`EXCLUDE',`%exclude $1')
define(`PLUGINFILES_EXCLUDE',`ifelse($1,`',,`EXCLUDE(%{webappprefix}/plugins/$1)
PLUGINFILES_EXCLUDE(shift($@))')')

%post
if [ -f /etc/zarafa/webapp/config.php ]; then
  sed -e "s/\(`define'('PASSWORD_KEY','\)a75356b0d1b81b7\(');\)/\1$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)\2/" \
      -e "s/\(`define'('PASSWORD_IV','\)b3f5a483\(');\)/\1$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)\2/" \
      -i /etc/zarafa/webapp/config.php
fi

%files
%defattr(-,root,root)
%dir %{webappprefix}/
%dir /var/lib/zarafa-webapp
%dir %{licensepath}/zarafa-webapp
ATTRIB %dir /var/lib/zarafa-webapp/tmp
%{webappprefix}/.htaccess
%{webappprefix}/*
%{licensepath}/zarafa-webapp/*
%config %dir %{_sysconfdir}/zarafa/webapp
%config(noreplace) %{_sysconfdir}/zarafa/webapp/config.php
%config(noreplace) %{apachepath}/zarafa-webapp.conf
PLUGINFILES_EXCLUDE(SEPARATE_PLUGINLIST)
PLUGINFILES_ONLY(INCLUDE_PLUGINLIST)

PLUGINFILES_FULL(SEPARATE_PLUGINLIST)

%changelog
* DATE - development@zarafa.com
- current release
* Wed Jun 27 2012 - john@zarafa.com
- split some plugins into separate packages
* Thu Jun 14 2012 - john@zarafa.com
- remove debug files in favor of source package
* Tue Feb 6 2012 - john@zarafa.com
- create package
