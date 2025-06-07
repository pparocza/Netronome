# Netronome Setup

## Download Netronome

To download the Netronome, click the green `Code` button above, and select `Download Zip`

![image](https://github.com/user-attachments/assets/621fa647-7cb9-4f7d-aa59-a9969c5b5bc2)

## Install JackTrip

- The Netronome was designed to manage the timing of audio being streamed via JackTrip, which you can download [here](https://www.jacktrip.com/download).

## Install Loopback Software

- In order to route audio between JackTrip and the Netronome, you will need either [Jack Audio Router](https://jackaudio.org/downloads/) (Windows) or [Rogue Amoeba's Loopback](https://rogueamoeba.com/loopback/) (Mac).

## Max Patch Setup
  
### Windows

#### Routing

<details>
  <summary>Video</summary><br>
    <video width = 320, height = 240, src="https://github.com/user-attachments/assets/2c135716-f1d0-4ee7-ba79-496d57339531" controls></video>
</details>

<details>
<summary>Step by Step</summary><br>

1. Open JACK Audio Router and click the `Start` button

![image](https://github.com/user-attachments/assets/acf8b0ac-fdca-47e7-9a8c-361733125753)

2. Click the `Graph` button to display audio devices

![image](https://github.com/user-attachments/assets/5e17489c-36fd-42d0-b1b6-f3518ca82311)

3. Open JackTrip, and click the `Settings` button

![image](https://github.com/user-attachments/assets/8ca3561e-190a-4250-8777-98938795e5c7)

4. In the Settings window, Click the `Advanced` tab

![image](https://github.com/user-attachments/assets/48c490e3-b758-46b9-be24-20249b3dc4c7)

5. From the `Audio Backend` menu in JackTrip, select "JACK" (JackTrip should then be visible in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/4fa67678-7d5b-446b-9096-155721e12adf)

6. In JackTrip, click the `Save` button

![image](https://github.com/user-attachments/assets/86c95493-1132-4940-9a39-9984f5a5b2c1)

7. Join a JackTrip studio from the "Your Studios" menu

![image](https://github.com/user-attachments/assets/f7f0cfce-66ee-48eb-8262-a2bcbdcebdcd)

8. Click `Connect to Session`

![image](https://github.com/user-attachments/assets/7492950d-f56e-497c-9ce2-efc6f9d81ccb)

9. Once you have connected to the studio in JackTrip, disconnect all connections to JackTrip In the JACK Audio Router Graph by clicking the JackTrip box, and pressing `Ctrl + D`

![image](https://github.com/user-attachments/assets/ea18086d-1f20-42d2-bba7-4883b0d9a5e5)

10. In JACK Audio Router, connect desired system inputs to outputs by click-dragging to and from the input and output nodes (In the example, a microphone connected to the first input of a Focusrite Scarlett 8i6 is connected to the interface's 1st and 2nd outputs).

![image](https://github.com/user-attachments/assets/6fe6e988-1c77-46be-b781-9d629f8c7f9a)

11. Within the `Netronome-main` folder downloaded from the "Download Netronome" step above, open the `MaxPatch` folder, and open `Netronome.maxpat`

![image](https://github.com/user-attachments/assets/31cc631d-3e07-461f-b94a-bde0acda310f)

12. From the `Audio Driver` menu, select JACK Audio Router

![image](https://github.com/user-attachments/assets/f72435dd-9139-42a6-8103-e0d7f349b0f1)

13. Click the button next to the `Audio Driver` so that it says "Audio On" (Max should then be visible in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/f717bf1f-3fb9-4f51-9926-ff07ec5bdce7)

14. In JACK Audio Router, connect desired system inputs to Max inputs.

![image](https://github.com/user-attachments/assets/c37d09b0-5386-42d7-8fad-97aeb188ffdc)

15. In Max, configure the `Local Input #` menus to match the connections set in step 14.

![image](https://github.com/user-attachments/assets/802a88fb-f9be-4e89-9bac-6f7678df101f)

16. In JACK Audio Router, connect Max Outputs to JackTrip inputs.

![image](https://github.com/user-attachments/assets/2246cc9b-f52e-4c64-96e7-dc1fd23ed095)

17. In Max, configure the `To Jacktrip-#` menus to match the connections set in the step 16.

![image](https://github.com/user-attachments/assets/e733da7e-93f1-476b-8249-6c80c64deb26)

18. In JACK Audio Router, connect the JackTrip outputs to empty Max inputs.

![image](https://github.com/user-attachments/assets/dfc6f583-e707-4bbe-8ab8-c390f971b390)

19. In Max, configure the `From JackTrip-#` menus to match the connections set in step 18.

![image](https://github.com/user-attachments/assets/38b15980-1e98-41e8-839a-d2861fdc7031)

20. In JACK Audio Router, connect Max Outputs to system outputs.

![image](https://github.com/user-attachments/assets/c333e40d-b0b9-4bff-ad54-ebd045ae585e)

21. In Max, configure the `Local Output #` menus to match the connections set in step 20.

![image](https://github.com/user-attachments/assets/816ae977-d721-40d2-8d1a-9b575b62f147)

22. In the `QUANTIZATION` portion of the Max Patch, set desired BPM and beat length values.

![image](https://github.com/user-attachments/assets/35b4c368-0fd7-4434-8c6b-02f3c68edaf8)

23. In the `LATENCY` portion of the Max Patch, set the `Latency` number box to match the value displayed in JackTrip
  - 23a. The `-` and `+` buttons to the left and right of the number box will adjust the value by millisecond increments.
  - 23b. The `METRONOME` section below `LATENCY COMPENSATION` can be used to check your timing against the `QUANTIZATION` settings.
  - 23c. Additional help with latency calibration can be found in the `Automatic Latency Calibration` section below.

![image](https://github.com/user-attachments/assets/0837ceac-3b86-462a-87ad-0c7c545c4d78)

24. PLAY!!!
</details>

#### Automatic Latency Calibration

<details>
  <summary>Video</summary><br>
  <video width = 320, height = 240, src="https://github.com/user-attachments/assets/5351da70-3164-4051-a3ca-239097040ef8" controls></video>
</details>

<details>
  <summary>Step by Step</summary><br>
  
1. In the `LATENCY COMPENSATION` portion of the Max Patch, set the `To-JackTrip` menu to match one of the `To JackTrip-#` menus in the `TO JACKTRIP` portion of the patch.

  ![image](https://github.com/user-attachments/assets/ef94fcd1-7193-45d2-a1d5-c05271aaaf29)

2. Set the `From-JackTrip` menu to match one of the `From JackTrip-#` menus.

![image](https://github.com/user-attachments/assets/e70c1e31-9efa-470c-a39d-3a0ae8ad1478)

3. Set the `Local Output (Direct)` menu to match one of the `Local Output #` menus.

![image](https://github.com/user-attachments/assets/b910c82e-1f6f-492e-b2ec-cb55902ca925)

4. Set the `Local Output (Adjusted)` menu to match one of the `Local Output #` menus.

![image](https://github.com/user-attachments/assets/d74acc44-d393-4232-97e2-427c609ab93b)

5. Click the `Send Latency Calibration Signal` button.
- NOTE: In order for the signal to be measured correctly, all other members of your current JackTrip session must mute whatever audio they are sending to JackTrip. In the Max Patch, this can be done by clicking the `Mute JackTrip i/o` button.

![image](https://github.com/user-attachments/assets/f00958a7-fd00-41c1-991b-281841cf011d)

6. To apply the `Difference` value to your current latency setting, click the `Apply to Latency Value` button.

![image](https://github.com/user-attachments/assets/d7897158-1dcb-4221-b83d-935ef274185d)

</details>
</details>

#### Presets

<details>
  <summary>Video</summary><br>
    <video width = 320, height = 240, src="https://github.com/user-attachments/assets/13d96c98-2607-40ad-8da9-dc070f4525ee" controls></video>
</details>

<details>
  <summary>Step By Step</summary><br>
  
1. To save the current routing configuration of the Max Patch as a preset, click the `Create` button in the `PRESETS` portion of the patch.
  
  ![image](https://github.com/user-attachments/assets/8be2a842-3987-4f38-96db-409aeb1fe984)

2. In the pop-up window that appears, type in the name you'd like the preset to have (without spaces) and click the `save` button, or press `Enter` on your keyboard.

![image](https://github.com/user-attachments/assets/20cc3c5c-02a8-4073-8556-9a547911fb52)

3. The current routing configuration can then be restored at any time by selecting the preset name from the menu.

![image](https://github.com/user-attachments/assets/963dd210-ea48-4ab9-ad7a-aa4a886fa82f)

- NOTE: If you create, overwrite, or delete a preset, you will need to save the MaxPatch in order for the changes to persist after the patch is closed

</details>

### Mac

#### Routing

#### Automatic Latency Calibration

#### Creating presets

## Max For Live Setup

### Windows

#### Routing

<details>
<summary>Video</summary><br>
      <video width = 320, height = 240, src="https://github.com/user-attachments/assets/50d1c839-cd16-4983-8d07-364f41589593" controls></video>
</details>

<details>
<summary>Step by Step</summary><br>

1. Open JACK Audio Router and click the `Start` button

![image](https://github.com/user-attachments/assets/acf8b0ac-fdca-47e7-9a8c-361733125753)

2. Click the `Graph` button to display audio devices

![image](https://github.com/user-attachments/assets/5e17489c-36fd-42d0-b1b6-f3518ca82311)

3. Open JackTrip, and click the `Settings` button

![image](https://github.com/user-attachments/assets/8ca3561e-190a-4250-8777-98938795e5c7)

4. In the Settings window, Click the `Advanced` tab

![image](https://github.com/user-attachments/assets/48c490e3-b758-46b9-be24-20249b3dc4c7)

5. From the `Audio Backend` menu in JackTrip, select "JACK" (JackTrip should then be visible in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/4fa67678-7d5b-446b-9096-155721e12adf)

6. In JackTrip, click the `Save` button

![image](https://github.com/user-attachments/assets/86c95493-1132-4940-9a39-9984f5a5b2c1)

7. Join a JackTrip studio from the "Your Studios" menu

![image](https://github.com/user-attachments/assets/f7f0cfce-66ee-48eb-8262-a2bcbdcebdcd)

8. Click `Connect to Session`

![image](https://github.com/user-attachments/assets/7492950d-f56e-497c-9ce2-efc6f9d81ccb)

9. Once you have connected to the studio in JackTrip, disconnect all connections to JackTrip In the JACK Audio Router Graph by clicking the JackTrip box, and pressing `Ctrl + D`

![image](https://github.com/user-attachments/assets/ea18086d-1f20-42d2-bba7-4883b0d9a5e5)

10. In the `Audio` tab of Ableton's `Preferences` window, set the Audio Device to "JackRouter" (Ableton should now appear in the JACK Audio Router Graph)

![image](https://github.com/user-attachments/assets/df1a2849-e47f-4d86-9b9d-6a52af91f453)

11. In the JACK Audio Router Graph, connect desired Ableton outputs to system outputs by click-dragging to and from the input and output nodes (In the example, a microphone connected to the first input of a Focusrite Scarlett 8i6 is connected to the interface's 1st and 2nd outputs).

![image](https://github.com/user-attachments/assets/de33e96a-573a-4ebf-a9df-d12f8817b20b)

12. Within the `Netronome-main` folder downloaded from the "Download Netronome" step above, open the `M4L` folder. In Ableton, create an Audio Track, and add the `M4L_Netronome_FromJackTrip.amxd` device to it.

![image](https://github.com/user-attachments/assets/d04cfa5d-6bcb-4db5-86ec-ffecd36023f7)

13. In the JACK Audio Router Graph, connect the JackTrip outputs to Ableton inputs 3 and 4.

![image](https://github.com/user-attachments/assets/33d86b3d-74e6-4327-893e-3359b2a3d7a6)

14. In Ableton, set the `Audio From` menus of the track with the `M4L_Netronome_FromJackTrip` device on it to `Ext. In` and `3/4`, and set the `Monitor` option to `In`

![image](https://github.com/user-attachments/assets/0d0e1344-538b-4c6c-ba19-49d39a79d234)

15. In Ableton, create a new Return track and add the `M4L_Netronome_ToJackTrip.amxd` device to it.

![image](https://github.com/user-attachments/assets/8351816e-f2e8-4b9f-b621-2e246b1b8e92)

16. 14. In Ableton, set the `Audio to` menus of the track with the `M4L_Netronome_ToJackTrip` device on it to `Ext. Out` and `3/4`.

![image](https://github.com/user-attachments/assets/c3c4b1b6-f3a3-4494-8490-90a785b3f0bd)

17. In the JACK Audio Router Graph, connect Ableton outputs 3 and 4 to JackTrip inputs 1 and 2.

![image](https://github.com/user-attachments/assets/c56d2c8b-6505-4bd9-82ba-185b36efad59)

18. Now, any audio sent to the return track containing the `M4L_Netronome_ToJackTrip.amxd` device will be sent to JackTrip.

![image](https://github.com/user-attachments/assets/90254e5f-2bdb-4e9a-8902-dde3ebe6f6fe)

19. In the `Latency` number box of the `M4L_Netronome_ToJackTrip` device, set the value to match the value displayed in JackTrip.
  - 19a. The `-` and `+` buttons to the left and right of the number box will adjust the value by millisecond increments.
  - 19b. Additional help with latency calibration can be found in the `Automatic Latency Calibration` section below.

![image](https://github.com/user-attachments/assets/62ee9ccd-127d-4ca8-938f-c6fd6227c871)

</details>

#### Automatic Latency Calibration

<details>
<summary>Video</summary><br>
  <video width = 320, height = 240, src="https://github.com/user-attachments/assets/95d85ae7-9e05-4a8d-8c2e-a7ac0e7116ae" controls></video>
</details>

<details>
<summary>Step by Step</summary><br>

1. After setting up the routing described above, click the `Send Latency Calibration Signal` button in the `M4L_Netronome_ToJackTrip` device.
- NOTE: In order for the signal to be measured correctly, all other members of your current JackTrip session must mute whatever audio they are sending to JackTrip. In the Max Patch, this can be done by clicking the `Mute JackTrip i/o` button.

![image](https://github.com/user-attachments/assets/4b002996-2e3b-4d2b-833b-a1918ebe9919)

2. To apply the `Difference` value to your current latency setting, click the `Apply to Latency Value` button.

![image](https://github.com/user-attachments/assets/22ba5391-b466-437e-b53d-e60340866cf1)

</details>

### Mac

#### Routing

#### Automatic Latency Calibration

## Netronome Transport

[Netronome Transport Server](https://dust-curved-bearskin.glitch.me/)
