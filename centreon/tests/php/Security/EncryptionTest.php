<?php

/*
 * Copyright 2005 - 2020 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */

namespace Tests\Security;

use PHPUnit\Framework\TestCase;
use Security\Encryption;

class EncryptionTest extends TestCase
{
    /**
     * @var string
     */
    private $firstKey;
    /**
     * @var string
     */
    private $secondKey;
    /**
     * @var string
     */
    private $falseKey;

    public function setUp(): void
    {
        parent::setUp(); // TODO: Change the autogenerated stub
        $this->falseKey = 'o3usvAMHw1lmTvvmlXIIpJPJEpuCEJLPVkbAaJEshz2FadxQqq7Ifiey8A/EM8OEWEcDdlb5oRCI3ZNDSBDcyQ==';
        $this->firstKey = 'UTgsISjmvIKH28VVPh165Hqwse5CdvIMnG2K31nOieRL9NuQ6VRsXbE7Jb2KUTYtWNBoc+vyLgPzPCtB4F6GDw==';
        $this->secondKey = '6iqKFqOUUD8mFncNtSqQPw7cgFypQ9O9H7qH17Z6Qd1zsGH0NmJdDwk2GI4/yqmOFnJqC5RKeUGKz55Xx/+mOg==';
    }

    public function testCryptDecrypt(): void
    {
        $messageToEncrypt = 'my secret message';
        $encryption = (new Encryption())
            ->setFirstKey($this->firstKey)
            ->setSecondKey($this->secondKey);

        $encrypedMessage = $encryption->crypt($messageToEncrypt);

        $decryptedMessage = $encryption->decrypt($encrypedMessage);
        $this->assertEquals($messageToEncrypt, $decryptedMessage);

        $encryption->setSecondKey($this->falseKey); // False second secret key
        $falseDecryptedMessage = $encryption->decrypt($encrypedMessage);
        $this->assertNull($falseDecryptedMessage);

        $encryption
            ->setFirstKey($this->falseKey) // False first secret key
            ->setSecondKey($this->secondKey);
        $falseDecryptedMessage = $encryption->decrypt($encrypedMessage);
        $this->assertNull($falseDecryptedMessage);
    }

    public function testExceptionOnFirstKeyWhileEncryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('First key not defined');
        $encryption = (new Encryption())
            ->setSecondKey($this->secondKey);

        // The data to be encrypted is not important
        $encryption->crypt($this->falseKey);
    }

    public function testExceptionOnSecondKeyWhileEncryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Second key not defined');
        $encryption = (new Encryption())
            ->setFirstKey($this->secondKey);

        // The data to be encrypted is not important
        $encryption->crypt($this->falseKey);
    }

    public function testWarningOnBadHashAlgorithmWhileEncryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('openssl_cipher_iv_length(): Unknown cipher algorithm');

        set_error_handler(function($errNo, $errStr, ...$args) {
            throw new \Exception($errStr);
            restore_error_handler();
        });
        $encryption = (new Encryption('bad-algorithm'))
            ->setFirstKey($this->secondKey)
            ->setSecondKey($this->secondKey);

        // The data to be encrypted is not important
        $encryption->crypt($this->falseKey);
    }

    public function testWarningOnBadHashMethodWhileEncryption(): void
    {
        $this->expectException(\ValueError::class);
        $this->expectExceptionMessage(
            'hash_hmac(): Argument #1 ($algo) must be a valid cryptographic hashing algorithm'
        );
        $encryption = (new Encryption('aes-256-cbc', 'bad-hash'))
            ->setFirstKey($this->secondKey)
            ->setSecondKey($this->secondKey);

        // The data to be encrypted is not important
        $encryption->crypt($this->falseKey);
    }

    public function testExceptionOnFirstKeyWhileDecryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('First key not defined');
        $encryption = (new Encryption())
            ->setSecondKey($this->firstKey);

        // The data to be decrypted is not important
        $encryption->decrypt($this->falseKey);
    }

    public function testExceptionOnSecondKeyWhileDecryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Second key not defined');
        $encryption = (new Encryption())
            ->setFirstKey($this->firstKey);

        // The data to be decrypted is not important
        $encryption->decrypt($this->falseKey);
    }

    public function testWarningOnBadHashAlgorithmWhileDecryption(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('openssl_cipher_iv_length(): Unknown cipher algorithm');

        set_error_handler(function($errNo, $errStr, ...$args) {
            throw new \Exception($errStr);
            restore_error_handler();
        });
        $encryption = (new Encryption('bad-algorithm'))
            ->setFirstKey($this->secondKey)
            ->setSecondKey($this->secondKey);

        // The data to be decrypted is not important
        $encryption->decrypt('456');
    }
}
