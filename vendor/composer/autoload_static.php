<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitde094b8b4a615d200424432c07821b85
{
    public static $prefixLengthsPsr4 = array (
        'W' => 
        array (
            'WMCS\\' => 5,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'WMCS\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitde094b8b4a615d200424432c07821b85::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitde094b8b4a615d200424432c07821b85::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitde094b8b4a615d200424432c07821b85::$classMap;

        }, null, ClassLoader::class);
    }
}
