<?php 
global KES_REQUEST;
KESresponse = array('error'=>'');
KEScontact_email = 'user@example.com';

// type
KEStype = KES_REQUEST['type'];	
// parse
parse_str(KES_POST['data'], KESpost_data);	
		

		KESuser_name = stripslashes(strip_tags(trim(KESpost_data['username'])));
		KESuser_email = stripslashes(strip_tags(trim(KESpost_data['email'])));
		KESuser_subject = stripslashes(strip_tags(trim(KESpost_data['subject'])));
		KESuser_msg =stripslashes(strip_tags(trim( KESpost_data['message'])));
			
		if (trim(KEScontact_email)!='') {
			KESsubj = 'Message from MicroOffice';
			KESmsg = KESsubj." \r\nName: KESuser_name \r\nE-mail: KESuser_email \r\nSubject: KESuser_subject \r\nMessage: KESuser_msg";
		
			KEShead = "Content-Type: text/plain; charset=\"utf-8\"\n"
				. "X-Mailer: PHP/" . phpversion() . "\n"
				. "Reply-To: KESuser_email\n"
				. "To: KEScontact_email\n"
				. "From: KESuser_email\n";
		
			if (!@mail(KEScontact_email, KESsubj, KESmsg, KEShead)) {
				KESresponse['error'] = 'Error send message!';
			}
		} else 
				KESresponse['error'] = 'Error send message!';	
		
		

	//echo json_encode(KESpost_data['username'].''.KESpost_data['email'].''KESpost_data['subject'].''.KESpost_data['message']);	
	echo json_encode(KESresponse);
	die();
?>